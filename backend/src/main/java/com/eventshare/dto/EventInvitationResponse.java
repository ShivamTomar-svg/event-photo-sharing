
package com.eventshare.dto;

import java.time.LocalDateTime;

import com.eventshare.entity.EventInvitation;

public class EventInvitationResponse {

    private Long id;
    private Long eventId;
    private String eventName;
    private Long inviteeId;
    private String inviteeEmail;
    private String status;
    private LocalDateTime invitedAt;

    public EventInvitationResponse(EventInvitation invitation) {
        this.id = invitation.getId();
        this.eventId = invitation.getEvent().getId();
        this.eventName = invitation.getEvent().getName();
        this.inviteeId = invitation.getGuest().getId();
        this.inviteeEmail = invitation.getGuest().getEmail();
        this.status = invitation.getStatus();
        this.invitedAt = invitation.getInvitedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getEventId() {
        return eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public Long getInviteeId() {
        return inviteeId;
    }

    public String getInviteeEmail() {
        return inviteeEmail;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }
}
