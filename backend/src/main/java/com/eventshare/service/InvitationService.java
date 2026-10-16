
package com.eventshare.service;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.eventshare.entity.Event;
import com.eventshare.entity.EventInvitation;
import com.eventshare.entity.User;
import com.eventshare.repository.EventInvitationRepository;
import com.eventshare.repository.EventRepository;
import com.eventshare.repository.UserRepository;

@Service
public class InvitationService {

    private final EventInvitationRepository invitationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public InvitationService(
            EventInvitationRepository invitationRepository,
            EventRepository eventRepository,
            UserRepository userRepository) {

        this.invitationRepository = invitationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    // Invite a registered guest to an event
    @Transactional
    public EventInvitation inviteGuest(
            Long eventId,
            String guestEmail,
            String authenticatedEmail) {

        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated user not found");
        }

        if (guestEmail == null || guestEmail.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Guest email is required");
        }

        String organizerEmail =
                authenticatedEmail.trim().toLowerCase(Locale.ROOT);

        String normalizedGuestEmail =
                guestEmail.trim().toLowerCase(Locale.ROOT);

        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found"));

        if (event.getOrganizer() == null
                || !event.getOrganizer().getId().equals(organizer.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the event organizer can invite guests");
        }

        User guest = userRepository.findByEmail(normalizedGuestEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Registered guest not found"));

        if (guest.getId().equals(organizer.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot invite yourself");
        }

        if (invitationRepository.existsByEventIdAndGuestIdAndStatus(
                eventId, guest.getId(),"PENDING")) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This guest has already been invited");
        }

        EventInvitation invitation = new EventInvitation();
        invitation.setEvent(event);
        invitation.setGuest(guest);
        invitation.setStatus("PENDING");

        return invitationRepository.save(invitation);
    }

    // Get invitations for the currently authenticated guest
    @Transactional(readOnly = true)
    public List<EventInvitation> getMyInvitations(
            String authenticatedEmail) {

        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated user not found");
        }

        String email = authenticatedEmail.trim().toLowerCase(Locale.ROOT);

        User guest = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Guest not found"));

        return invitationRepository.findByGuestId(guest.getId());
    }

    // Accept or decline an invitation
    @Transactional
    public EventInvitation respondToInvitation(
            Long invitationId,
            String response,
            String authenticatedEmail) {

        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated user not found");
        }

        if (response == null || response.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Response must be ACCEPTED or DECLINED");
        }

        String normalizedResponse =
                response.trim().toUpperCase(Locale.ROOT);

        if (!normalizedResponse.equals("ACCEPTED")
                && !normalizedResponse.equals("DECLINED")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Response must be ACCEPTED or DECLINED");
        }

        String email = authenticatedEmail.trim().toLowerCase(Locale.ROOT);

        User guest = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));

        EventInvitation invitation = invitationRepository
                .findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found"));

        if (invitation.getGuest() == null
                || !invitation.getGuest().getId().equals(guest.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot respond to another user's invitation");
        }

        if (!"PENDING".equalsIgnoreCase(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This invitation has already been answered");
        }

        invitation.setStatus(normalizedResponse);

        return invitationRepository.save(invitation);
    }
}
