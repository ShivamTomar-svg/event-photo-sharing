
package com.eventshare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class InvitationResponseRequest {

    @NotBlank(message = "Status is required")
    @Pattern(
        regexp = "ACCEPTED|REJECTED",
        flags = Pattern.Flag.CASE_INSENSITIVE,
        message = "Status must be ACCEPTED or REJECTED"
    )
    private String status;

    public InvitationResponseRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
