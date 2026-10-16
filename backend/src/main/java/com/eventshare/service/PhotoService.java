
package com.eventshare.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.eventshare.entity.Event;
import com.eventshare.entity.Photo;
import com.eventshare.entity.User;
import com.eventshare.repository.EventInvitationRepository;
import com.eventshare.repository.EventRepository;
import com.eventshare.repository.PhotoRepository;
import com.eventshare.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventInvitationRepository eventInvitationRepository;

    private final Path uploadDirectory =
            Paths.get("C:/eventshare-uploads")
                    .toAbsolutePath()
                    .normalize();

    public PhotoService(
            PhotoRepository photoRepository,
            EventRepository eventRepository,
            UserRepository userRepository,
            EventInvitationRepository eventInvitationRepository) {
        this.photoRepository = photoRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.eventInvitationRepository = eventInvitationRepository;
    }

    private User getAuthenticatedUser(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));
    }

    private Event getEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found"));
    }

    private boolean isOrganizer(Event event, User user) {
        return event.getOrganizer() != null
                && event.getOrganizer().getId().equals(user.getId());
    }

    private boolean isAcceptedMember(Event event, User user) {
        return eventInvitationRepository
                .existsByEventIdAndGuestIdAndStatus(
                        event.getId(), user.getId(), "ACCEPTED");
    }

    private void requireEventMember(Event event, User user) {
        if (!isOrganizer(event, user)
                && !isAcceptedMember(event, user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to access this event's photos");
        }
    }

    private Photo getPhotoForEvent(Long eventId, Long photoId) {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Photo not found"));

        if (photo.getEvent() == null
                || !photo.getEvent().getId().equals(eventId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Photo not found for this event");
        }

        return photo;
    }

    public List<Photo> getPhotosByEvent(Long eventId, String email) {
        User user = getAuthenticatedUser(email);
        Event event = getEvent(eventId);
        requireEventMember(event, user);

        return photoRepository.findByEventId(eventId);
    }

    public Photo getAuthorizedPhoto(
            Long eventId, Long photoId, String email) {
        User user = getAuthenticatedUser(email);
        Event event = getEvent(eventId);
        requireEventMember(event, user);

        return getPhotoForEvent(eventId, photoId);
    }

    public List<Photo> getPhotosByUploader(Long userId) {
        return photoRepository.findByUploadedById(userId);
    }

    @Transactional
    public Photo uploadPhoto(
            Long eventId, String email, MultipartFile file) {

        User user = getAuthenticatedUser(email);
        Event event = getEvent(eventId);
        requireEventMember(event, user);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select a photo");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Maximum photo size is 10 MB");
        }

        String contentType = file.getContentType();
        if (contentType == null
                || !contentType.toLowerCase().startsWith("image/")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only image files are allowed");
        }

        String originalName = file.getOriginalFilename();
        String extension = "";

        if (originalName != null) {
            int dot = originalName.lastIndexOf('.');
            if (dot >= 0 && dot < originalName.length() - 1) {
                String candidate = originalName.substring(dot);
                if (candidate.matches("(?i)\\.[a-z0-9]{1,10}")) {
                    extension = candidate;
                }
            }
        }

        String storedName = UUID.randomUUID() + extension;
        Path destination = uploadDirectory.resolve(storedName).normalize();

        if (!destination.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        try {
            Files.createDirectories(uploadDirectory);
            file.transferTo(destination);
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save photo");
        }

        Photo photo = new Photo();
        photo.setFileName(
                originalName == null || originalName.isBlank()
                        ? storedName : originalName);
        photo.setFilePath(destination.toString());
        photo.setContentType(contentType);
        photo.setFileSize(file.getSize());
        photo.setEvent(event);
        photo.setUploadedBy(user);

        try {
            return photoRepository.saveAndFlush(photo);
        } catch (RuntimeException e) {
            try {
                Files.deleteIfExists(destination);
            } catch (IOException cleanupError) {
                e.addSuppressed(cleanupError);
            }
            throw e;
        }
    }

    @Transactional
    public void deletePhoto(
            Long eventId, Long photoId, String email) {

        User user = getAuthenticatedUser(email);
        Event event = getEvent(eventId);
        requireEventMember(event, user);

        Photo photo = getPhotoForEvent(eventId, photoId);

        boolean uploader = photo.getUploadedBy() != null
                && photo.getUploadedBy().getId().equals(user.getId());

        if (!uploader && !isOrganizer(event, user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the photo uploader or event organizer can delete this photo");
        }

        Path path = Paths.get(photo.getFilePath())
                .toAbsolutePath()
                .normalize();

        if (!path.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Invalid stored photo path");
        }

        try {
            photoRepository.delete(photo);
            photoRepository.flush();
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not delete the photo file");
        }
    }
}
