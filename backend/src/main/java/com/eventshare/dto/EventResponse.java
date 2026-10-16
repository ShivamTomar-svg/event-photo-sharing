
package com.eventshare.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.eventshare.entity.Event;

public class EventResponse {

    private Long id;
    private String name;
    private String description;
    private LocalDate eventDate;
    private String location;
    private Long organizerId;
    private String organizerName;
    private LocalDateTime createdAt;

    public EventResponse(Event event) {
        this.id = event.getId();
        this.name = event.getName();
        this.description = event.getDescription();
        this.eventDate = event.getEventDate();
        this.location = event.getLocation();
        this.organizerId = event.getOrganizer().getId();
        this.organizerName = event.getOrganizer().getFullName();
        this.createdAt = event.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public String getLocation() {
        return location;
    }

    public Long getOrganizerId() {
        return organizerId;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
