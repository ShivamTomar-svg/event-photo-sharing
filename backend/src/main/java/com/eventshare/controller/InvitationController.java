
package com.eventshare.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.eventshare.entity.EventInvitation;
import com.eventshare.service.InvitationService;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    // Organizer invites a registered guest
    @PostMapping("/event/{eventId}")
    public ResponseEntity<Map<String, Object>> inviteGuest(
            @PathVariable Long eventId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String guestEmail = request.get("guestEmail");

        if (guestEmail == null || guestEmail.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Guest email is required"));
        }

        EventInvitation invitation = invitationService.inviteGuest(
                eventId,
                guestEmail,
                authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Invitation created successfully",
                        "invitationId", invitation.getId(),
                        "eventId", invitation.getEvent().getId(),
                        "guestId", invitation.getGuest().getId(),
                        "status", invitation.getStatus()));
    }

    // Logged-in guest views their invitations
    @GetMapping("/my")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getMyInvitations(
            Authentication authentication) {

        List<Map<String, Object>> invitations =
                invitationService.getMyInvitations(authentication.getName())
                .stream()
                .map(invitation -> Map.<String, Object>of(
                        "invitationId", invitation.getId(),
                        "eventId", invitation.getEvent().getId(),
                        "eventName", invitation.getEvent().getName(),
                        "eventDate", invitation.getEvent().getEventDate(),
                        "location", invitation.getEvent().getLocation(),
                        "organizerName", invitation.getEvent()
                                .getOrganizer().getFullName(),
                        "status", invitation.getStatus(),
                        "invitedAt", invitation.getInvitedAt()))
                .toList();

        return ResponseEntity.ok(invitations);
    }

    // Guest accepts or declines an invitation
    @PutMapping("/{invitationId}/respond")
    public ResponseEntity<Map<String, Object>> respondToInvitation(
            @PathVariable Long invitationId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String response = request.get("response");

        if (response == null || response.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Response must be ACCEPTED or DECLINED"));
        }

        EventInvitation invitation =
                invitationService.respondToInvitation(
                        invitationId,
                        response,
                        authentication.getName());

        return ResponseEntity.ok(Map.of(
                "message", "Invitation response saved successfully",
                "invitationId", invitation.getId(),
                "status", invitation.getStatus()));
    }
}
