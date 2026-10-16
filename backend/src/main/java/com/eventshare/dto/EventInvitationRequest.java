
package com.eventshare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class EventInvitationRequest {

    @NotBlank(message = "Guest email is required")
    @Email(message = "Enter a valid guest email")
    private String guestEmail;

    public EventInvitationRequest() {
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }
}
