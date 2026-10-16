
package com.eventshare.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.eventshare.dto.EventRequest;
import com.eventshare.dto.EventResponse;
import com.eventshare.entity.Event;
import com.eventshare.entity.EventInvitation;
import com.eventshare.entity.User;
import com.eventshare.repository.EventInvitationRepository;
import com.eventshare.repository.EventRepository;
import com.eventshare.repository.UserRepository;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventInvitationRepository invitationRepository;

    public EventService(
            EventRepository eventRepository,
            UserRepository userRepository,
            EventInvitationRepository invitationRepository) {

        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.invitationRepository = invitationRepository;
    }

    // Create an event for the authenticated user
    @Transactional
    public EventResponse createEvent(
            EventRequest request,
            String authenticatedEmail) {

        String email = normalizeEmail(authenticatedEmail);

        User organizer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));

        Event event = new Event();
        event.setName(request.getName().trim());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setLocation(request.getLocation().trim());
        event.setOrganizer(organizer);

        Event savedEvent = eventRepository.save(event);

        return new EventResponse(savedEvent);
    }

    // Return only events owned by the user or accepted invitations
    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents(String authenticatedEmail) {

        User user = findUser(authenticatedEmail);

        Map<Long, Event> accessibleEvents = new LinkedHashMap<>();

        // Events created by this user
        for (Event event : eventRepository.findByOrganizerId(user.getId())) {
            accessibleEvents.put(event.getId(), event);
        }

        // Events the user has been invited to
        List<EventInvitation> invitations =
                invitationRepository.findByGuestId(user.getId());

        for (EventInvitation invitation : invitations) {
            if ("ACCEPTED".equalsIgnoreCase(invitation.getStatus())) {
                Event event = invitation.getEvent();
                accessibleEvents.put(event.getId(), event);
            }
        }

        return accessibleEvents.values()
                .stream()
                .map(EventResponse::new)
                .toList();
    }

    // Check whether a user can access a particular event
    @Transactional(readOnly = true)
    public Event getAccessibleEvent(
            Long eventId,
            String authenticatedEmail) {

        User user = findUser(authenticatedEmail);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found"));

        // The organizer can access their own event
        if (event.getOrganizer().getId().equals(user.getId())) {
            return event;
        }

        // Other users must have an accepted invitation
        EventInvitation invitation = invitationRepository
                .findByEventIdAndGuestId(eventId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You do not have access to this event"));

        if (!"ACCEPTED".equalsIgnoreCase(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Accept the invitation before accessing this event");
        }

        return event;
    }

    private User findUser(String authenticatedEmail) {
        String email = normalizeEmail(authenticatedEmail);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
