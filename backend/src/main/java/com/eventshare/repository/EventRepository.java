
package com.eventshare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eventshare.entity.Event;
import com.eventshare.entity.EventInvitation;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Find all events created by a specific organizer
    List<Event> findByOrganizerId(Long organizerId);

    // Find events for which a user has an invitation
    @Query("""
        SELECT ei.event
        FROM EventInvitation ei
        WHERE ei.guest.id = :guestId
    """)
    List<Event> findInvitedEventsByGuestId(
            @Param("guestId") Long guestId);
}
