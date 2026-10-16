
package com.eventshare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventshare.entity.EventInvitation;

public interface EventInvitationRepository
        extends JpaRepository<EventInvitation, Long> {

    boolean existsByEventIdAndGuestIdAndStatus(Long eventId, Long guestId,String status);

    Optional<EventInvitation> findByEventIdAndGuestId(
            Long eventId, Long guestId);

    List<EventInvitation> findByGuestId(Long guestId);

    List<EventInvitation> findByEventId(Long eventId);
}
