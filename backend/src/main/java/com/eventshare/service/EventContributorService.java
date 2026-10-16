
package com.eventshare.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.eventshare.entity.Event;
import com.eventshare.entity.EventContributor;
import com.eventshare.entity.User;
import com.eventshare.repository.EventContributorRepository;
import com.eventshare.repository.EventRepository;
import com.eventshare.repository.UserRepository;

@Service
public class EventContributorService {

    private final EventContributorRepository contributorRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventContributorService(
            EventContributorRepository contributorRepository,
            EventRepository eventRepository,
            UserRepository userRepository) {

        this.contributorRepository = contributorRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    // 1. Guest requests contributor access
    @Transactional
    public EventContributor requestAccess(
            Long eventId, String authenticatedEmail) {

        User user = findUser(authenticatedEmail);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found"));

        // Only users with accepted invitations can request access
        if (!event.getOrganizer().getId().equals(user.getId())) {
            // Organizers already have upload access
            if (!hasAcceptedInvitation(eventId, user.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Accept the event invitation before requesting contributor access");
            }
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The event organizer does not need contributor approval");
        }

        // Prevent duplicate requests
        if (contributorRepository.existsByEventIdAndUserId(
                eventId, user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A contributor request already exists");
        }

        EventContributor contributor = new EventContributor();
        contributor.setEvent(event);
        contributor.setUser(user);
        contributor.setStatus("PENDING");

        return contributorRepository.save(contributor);
    }

    // 2. Organizer views contributor requests for an event
    @Transactional(readOnly = true)
    public List<EventContributor> getRequests(
            Long eventId, String organizerEmail) {

        Event event = findEvent(eventId);

        verifyOrganizer(event, organizerEmail);

        return contributorRepository.findByEventId(eventId);
    }

    // 3. Organizer approves or rejects a contributor request
    @Transactional
    public EventContributor reviewRequest(
            Long eventId,
            Long requestId,
            String status,
            String organizerEmail) {

        Event event = findEvent(eventId);

        verifyOrganizer(event, organizerEmail);

        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Status is required");
        }

        String normalizedStatus =
                status.trim().toUpperCase(Locale.ROOT);

        if (!normalizedStatus.equals("APPROVED")
                && !normalizedStatus.equals("REJECTED")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be APPROVED or REJECTED");
        }

        EventContributor contributor =
                contributorRepository.findById(requestId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Contributor request not found"));

        if (!contributor.getEvent().getId().equals(eventId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Contributor request does not belong to this event");
        }

        if (!"PENDING".equalsIgnoreCase(contributor.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This contributor request has already been reviewed");
        }

        contributor.setStatus(normalizedStatus);
        contributor.setReviewedAt(LocalDateTime.now());

        return contributorRepository.save(contributor);
    }

    // 4. Check if a user can upload photos
    @Transactional(readOnly = true)
    public boolean canUpload(Long eventId, String authenticatedEmail) {

        User user = findUser(authenticatedEmail);

        Event event = findEvent(eventId);

        // The organizer can upload directly
        if (event.getOrganizer().getId().equals(user.getId())) {
            return true;
        }

        return contributorRepository
                .existsByEventIdAndUserIdAndStatus(
                        eventId, user.getId(), "APPROVED");
    }

    private User findUser(String email) {
        String normalizedEmail = normalizeEmail(email);

        return userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));
    }

    private Event findEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found"));
    }

    private void verifyOrganizer(Event event, String organizerEmail) {
        if (!event.getOrganizer().getEmail()
                .equalsIgnoreCase(normalizeEmail(organizerEmail))) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the event organizer can manage contributors");
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated email is missing");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    private boolean hasAcceptedInvitation(Long eventId, Long userId) {
        // Implemented using EventInvitationRepository
        // in the constructor and helper below.
        return invitationRepository.existsByEventIdAndGuestIdAndStatus(
                eventId, userId, "ACCEPTED");
    }

    private final com.eventshare.repository.EventInvitationRepository
            invitationRepository = null;
}
