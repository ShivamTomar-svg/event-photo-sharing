
package com.eventshare.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventshare.entity.EventContributor;
import com.eventshare.service.EventContributorService;

@RestController
@RequestMapping("/api/events/{eventId}/contributors")
public class EventContributorController {

    private final EventContributorService contributorService;

    public EventContributorController(
            EventContributorService contributorService) {
        this.contributorService = contributorService;
    }

    // 1. Guest requests contributor access
    @PostMapping("/request")
    public ResponseEntity<EventContributor> requestAccess(
            @PathVariable Long eventId,
            Authentication authentication) {

        EventContributor contributor =
                contributorService.requestAccess(
                        eventId,
                        authentication.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(contributor);
    }

    // 2. Organizer views contributor requests
    @GetMapping
    public ResponseEntity<List<EventContributor>> getRequests(
            @PathVariable Long eventId,
            Authentication authentication) {

        List<EventContributor> requests =
                contributorService.getRequests(
                        eventId,
                        authentication.getName());

        return ResponseEntity.ok(requests);
    }

    // 3. Organizer approves or rejects a request
    @PutMapping("/{requestId}/review")
    public ResponseEntity<EventContributor> reviewRequest(
            @PathVariable Long eventId,
            @PathVariable Long requestId,
            @RequestBody ReviewContributorRequest request,
            Authentication authentication) {

        if (request == null || request.getStatus() == null) {
            return ResponseEntity.badRequest().build();
        }

        EventContributor contributor =
                contributorService.reviewRequest(
                        eventId,
                        requestId,
                        request.getStatus(),
                        authentication.getName());

        return ResponseEntity.ok(contributor);
    }

    // 4. Check upload permission
    @GetMapping("/upload-permission")
    public ResponseEntity<Boolean> checkUploadPermission(
            @PathVariable Long eventId,
            Authentication authentication) {

        boolean allowed = contributorService.canUpload(
                eventId,
                authentication.getName());

        return ResponseEntity.ok(allowed);
    }

    // Request DTO for organizer's review
    public static class ReviewContributorRequest {

        private String status;

        public ReviewContributorRequest() {
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
