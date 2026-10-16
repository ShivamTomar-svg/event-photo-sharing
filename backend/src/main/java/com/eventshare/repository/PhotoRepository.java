package com.eventshare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventshare.entity.Photo;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findByEventId(Long eventId);

    List<Photo> findByUploadedById(Long userId);
}