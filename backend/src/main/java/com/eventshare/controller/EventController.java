
package com.eventshare.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventshare.dto.EventRequest;
import com.eventshare.dto.EventResponse;
import com.eventshare.entity.Event;
import com.eventshare.service.EventService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events")
@Validated
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // 1. Create an event
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @Valid @RequestBody EventRequest request,
            Authentication authentication) {

        EventResponse response = eventService.createEvent(
                request,
                authentication.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 2. Get events accessible to the logged-in user
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents(
            Authentication authentication) {

        List<EventResponse> events =
                eventService.getAllEvents(authentication.getName());

        return ResponseEntity.ok(events);
    }

    // 3. Get one event after checking access permissions
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<EventResponse> getEventById(
            @PathVariable Long id,
            Authentication authentication) {

        Event event = eventService.getAccessibleEvent(
                id,
                authentication.getName());

        EventResponse response = new EventResponse(event);

        return ResponseEntity.ok(response);
    }
}
