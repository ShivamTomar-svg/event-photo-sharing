
package com.eventshare.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.eventshare.dto.EventInvitationResponse;
import com.eventshare.entity.Event;
import com.eventshare.entity.EventInvitation;
import com.eventshare.entity.User;
import com.eventshare.repository.EventInvitationRepository;
import com.eventshare.repository.EventRepository;
import com.eventshare.repository.UserRepository;

@Service
public class EventInvitationService {

    private final EventInvitationRepository invitationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventInvitationService(
            EventInvitationRepository invitationRepository,
            EventRepository eventRepository,
            UserRepository userRepository) {

        this.invitationRepository = invitationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    // 1. Invite a registered guest
    @Transactional
    public EventInvitationResponse inviteGuest(
            Long eventId,
            String guestEmail,
            String organizerEmail) {

        String organizer = normalizeEmail(organizerEmail);
        String guestAddress = normalizeEmail(guestEmail);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found"));

        if (event.getOrganizer() == null
                || !organizer.equals(
                        normalizeEmail(event.getOrganizer().getEmail()))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the event organizer can invite guests");
        }

        User guest = userRepository.findByEmail(guestAddress)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Guest account not found. The guest must register first."));

        if (guest.getId().equals(event.getOrganizer().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The organizer cannot invite themselves");
        }
        if (invitationRepository.existsByEventIdAndGuestIdAndStatus(
                eventId, guest.getId(), "PENDING")) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This guest has already been invited");
        }

        EventInvitation invitation = new EventInvitation();
        invitation.setEvent(event);
        invitation.setGuest(guest);
        invitation.setStatus("PENDING");

        EventInvitation saved = invitationRepository.save(invitation);

        return new EventInvitationResponse(saved);
    }

    // 2. Get invitations for an event (organizer only)
    @Transactional(readOnly = true)
    public List<EventInvitationResponse> getEventInvitations(
            Long eventId,
            String organizerEmail) {

        String organizer = normalizeEmail(organizerEmail);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found"));

        if (event.getOrganizer() == null
                || !organizer.equals(
                        normalizeEmail(event.getOrganizer().getEmail()))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the event organizer can view invitations");
        }

        return invitationRepository.findByEventId(eventId)
                .stream()
                .map(EventInvitationResponse::new)
                .toList();
    }

    // 3. Get invitations received by the logged-in guest
    @Transactional(readOnly = true)
    public List<EventInvitationResponse> getMyInvitations(
            String guestEmail) {

        String email = normalizeEmail(guestEmail);

        User guest = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User account not found"));

        return invitationRepository.findByGuestId(guest.getId())
                .stream()
                .map(EventInvitationResponse::new)
                .toList();
    }

    // 4. Accept or decline an invitation
    @Transactional
    public EventInvitationResponse respondToInvitation(
            Long invitationId,
            String guestEmail,
            String status) {

        String email = normalizeEmail(guestEmail);

        String normalizedStatus = status == null
                ? ""
                : status.trim().toUpperCase(Locale.ROOT);

        if (!normalizedStatus.equals("ACCEPTED")
                && !normalizedStatus.equals("DECLINED")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be ACCEPTED or DECLINED");
        }

        EventInvitation invitation = invitationRepository
                .findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found"));

        // Only the invited guest may respond
        if (invitation.getGuest() == null
                || !email.equals(
                        normalizeEmail(invitation.getGuest().getEmail()))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only respond to your own invitations");
        }

        // Prevent a second response
        if (!"PENDING".equalsIgnoreCase(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This invitation has already been responded to");
        }

        invitation.setStatus(normalizedStatus);
        invitation.setRespondedAt(LocalDateTime.now());

        EventInvitation saved = invitationRepository.save(invitation);

        return new EventInvitationResponse(saved);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }
}
