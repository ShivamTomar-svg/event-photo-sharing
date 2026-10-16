
package com.eventshare.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.eventshare.dto.PhotoResponse;
import com.eventshare.entity.Photo;
import com.eventshare.service.PhotoService;

@RestController
@RequestMapping("/api/events/{eventId}/photos")
public class PhotoController {

    private final PhotoService photoService;

    private final Path uploadDirectory =
            Paths.get("C:/eventshare-uploads")
                    .toAbsolutePath()
                    .normalize();

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    // List photos for an event
    @GetMapping
    public ResponseEntity<List<PhotoResponse>> getPhotosByEvent(
            @PathVariable Long eventId,
            Principal principal) {

        List<PhotoResponse> response =
                photoService.getPhotosByEvent(
                                eventId, principal.getName())
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    // Upload a photo
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoResponse> uploadPhoto(
            @PathVariable Long eventId,
            @RequestParam("file") MultipartFile file,
            Principal principal) {

        Photo photo = photoService.uploadPhoto(
                eventId, principal.getName(), file);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(photo));
    }

    // View a photo in the browser
    @GetMapping("/{photoId}/view")
    public ResponseEntity<byte[]> viewPhoto(
            @PathVariable Long eventId,
            @PathVariable Long photoId,
            Principal principal) throws IOException {

        Photo photo = photoService.getAuthorizedPhoto(
                eventId, photoId, principal.getName());

        Path path = getExistingFilePath(photo);

        MediaType mediaType;

        try {
            mediaType = MediaType.parseMediaType(
                    photo.getContentType());
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Invalid photo content type");
        }

        byte[] image = Files.readAllBytes(path);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline")
                .header("X-Content-Type-Options", "nosniff")
                .body(image);
    }

    // Download a photo
    @GetMapping("/{photoId}/download")
    public ResponseEntity<byte[]> downloadPhoto(
            @PathVariable Long eventId,
            @PathVariable Long photoId,
            Principal principal) throws IOException {

        Photo photo = photoService.getAuthorizedPhoto(
                eventId, photoId, principal.getName());

        Path path = getExistingFilePath(photo);

        byte[] image = Files.readAllBytes(path);

        // Sanitize the filename before using it in the HTTP header.
        String originalFileName = photo.getFileName();

        if (originalFileName == null
                || originalFileName.isBlank()) {
            originalFileName = "photo";
        }

        String safeFileName = originalFileName
                .replaceAll("[\\\\/\\r\\n\"]", "_");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\""
                                + safeFileName + "\"")
                .header("X-Content-Type-Options", "nosniff")
                .body(image);
    }

    // Delete a photo
    @DeleteMapping("/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            @PathVariable Long eventId,
            @PathVariable Long photoId,
            Principal principal) {

        photoService.deletePhoto(
                eventId, photoId, principal.getName());

        return ResponseEntity.noContent().build();
    }

    // Validate the stored path and confirm the file exists.
    private Path getExistingFilePath(Photo photo) {

        Path path = Paths.get(photo.getFilePath())
                .toAbsolutePath()
                .normalize();

        if (!path.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Invalid stored photo path");
        }

        if (!Files.isRegularFile(path)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Photo file not found on server");
        }

        return path;
    }

    // Convert the entity into the API response DTO.
    private PhotoResponse toResponse(Photo photo) {

        return new PhotoResponse(
                photo.getId(),
                photo.getFileName(),
                photo.getContentType(),
                photo.getFileSize(),
                photo.getEvent().getId(),
                photo.getUploadedBy().getId(),
                photo.getUploadedAt());
    }
}
