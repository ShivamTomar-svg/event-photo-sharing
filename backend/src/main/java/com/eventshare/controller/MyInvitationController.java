
package com.eventshare.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.eventshare.dto.EventInvitationResponse;
import com.eventshare.service.EventInvitationService;

@RestController
@RequestMapping("/api/my-invitations")
public class MyInvitationController {

    private final EventInvitationService eventInvitationService;

    public MyInvitationController(
            EventInvitationService eventInvitationService) {
        this.eventInvitationService = eventInvitationService;
    }

    // View invitations received by the logged-in guest
    @GetMapping
    public ResponseEntity<List<EventInvitationResponse>> getMyInvitations(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in first");
        }

        List<EventInvitationResponse> invitations =
                eventInvitationService.getMyInvitations(
                        authentication.getName());

        return ResponseEntity.ok(invitations);
    }

    // Accept or reject an invitation
    @PutMapping("/{invitationId}/respond")
    public ResponseEntity<EventInvitationResponse> respondToInvitation(
            @PathVariable Long invitationId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in first");
        }

        if (request == null || request.get("status") == null
                || request.get("status").isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status is required: ACCEPTED or REJECTED");
        }

        EventInvitationResponse response =
                eventInvitationService.respondToInvitation(
                        invitationId,
                        authentication.getName(),
                        request.get("status"));

        return ResponseEntity.ok(response);
    }
}
