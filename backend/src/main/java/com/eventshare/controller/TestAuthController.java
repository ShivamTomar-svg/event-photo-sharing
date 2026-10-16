
package com.eventshare.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.core.Authentication;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestAuthController {

@PostMapping("/check-post")
public Map<String, String> checkPost(Authentication authentication) {
    return Map.of(
        "status", "AUTHENTICATED",
        "email", authentication.getName(),
        "method", "POST"
    );
}

    @GetMapping("/protected")
    public Map<String, String> protectedEndpoint(
            Authentication authentication) {

        return Map.of(
            "message", "JWT authentication successful",
            "email", authentication.getName(),
            "status", "AUTHENTICATED"
        );
    }
}
