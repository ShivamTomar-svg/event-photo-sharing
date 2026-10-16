
package com.eventshare.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventshare.dto.EventInvitationRequest;
import com.eventshare.dto.EventInvitationResponse;
import com.eventshare.service.EventInvitationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events/{eventId}/invitations")
public class EventInvitationController {

    private final EventInvitationService eventInvitationService;

    public EventInvitationController(
            EventInvitationService eventInvitationService) {
        this.eventInvitationService = eventInvitationService;
    }

    // 1. Invite a registered guest
    @PostMapping
    public ResponseEntity<EventInvitationResponse> inviteGuest(
            @PathVariable Long eventId,
            @Valid @RequestBody EventInvitationRequest request,
            Authentication authentication) {

        EventInvitationResponse response =
                eventInvitationService.inviteGuest(
                        eventId,
                        request.getGuestEmail(),
                        authentication.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 2. Get all invitations for an event
    @GetMapping
    public ResponseEntity<List<EventInvitationResponse>> getEventInvitations(
            @PathVariable Long eventId,
            Authentication authentication) {

        List<EventInvitationResponse> invitations =
                eventInvitationService.getEventInvitations(
                        eventId,
                        authentication.getName());

        return ResponseEntity.ok(invitations);
    }
}
