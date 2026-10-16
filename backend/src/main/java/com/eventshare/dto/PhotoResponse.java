
package com.eventshare.dto;

import java.time.LocalDateTime;

public class PhotoResponse {

    private Long id;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private Long eventId;
    private Long uploadedById;
    private LocalDateTime uploadedAt;

    public PhotoResponse() {
    }

    public PhotoResponse(
            Long id,
            String fileName,
            String contentType,
            Long fileSize,
            Long eventId,
            Long uploadedById,
            LocalDateTime uploadedAt) {
        this.id = id;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.eventId = eventId;
        this.uploadedById = uploadedById;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public void setUploadedById(Long uploadedById) {
        this.uploadedById = uploadedById;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
