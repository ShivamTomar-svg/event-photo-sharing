
package com.eventshare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventshare.entity.EventContributor;

@Repository
public interface EventContributorRepository
        extends JpaRepository<EventContributor, Long> {

    // Find all contributor requests for an event
    List<EventContributor> findByEventId(Long eventId);

    // Find all requests made by a user
    List<EventContributor> findByUserId(Long userId);

    // Find a user's contributor request for a particular event
    Optional<EventContributor> findByEventIdAndUserId(
            Long eventId, Long userId);

    // Check whether a request already exists
    boolean existsByEventIdAndUserId(
            Long eventId, Long userId);

    // Find approved contributors for an event
    List<EventContributor> findByEventIdAndStatus(
            Long eventId, String status);

    // Check whether a user is approved to upload to an event
    boolean existsByEventIdAndUserIdAndStatus(
            Long eventId, Long userId, String status);
}
