package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final UserRepository userRepository;

    public FileUploadController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/gov-id")
    public ResponseEntity<?> uploadGovId(@RequestBody Map<String, String> body) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();

        String base64Image = body.get("documentUrl");
        if (base64Image == null || base64Image.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No image provided"));
        }

        user.setDocumentUrl(base64Image);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Government ID uploaded successfully"));
    }

    @GetMapping("/gov-id/{userId}")
    public ResponseEntity<?> getGovId(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        String docUrl = user.getDocumentUrl();
        if (docUrl == null || docUrl.isBlank()) {
            return ResponseEntity.ok(Map.of("documentUrl", "", "message", "No government ID uploaded"));
        }
        return ResponseEntity.ok(Map.of("documentUrl", docUrl));
    }
}
