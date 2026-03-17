package com.example.demo.controller;

import com.example.demo.entity.Review;
import com.example.demo.entity.Property;
import com.example.demo.entity.User;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.PropertyRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, PropertyRepository propertyRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Review>> getPropertyReviews(@PathVariable Long propertyId) {
        return ResponseEntity.ok(reviewRepository.findByPropertyId(propertyId));
    }

    @PostMapping("/property/{propertyId}")
    public ResponseEntity<Review> addReview(@PathVariable Long propertyId, @RequestBody Review reviewRequest) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();
        Property property = propertyRepository.findById(propertyId).orElseThrow();

        Review review = Review.builder()
                .user(user)
                .property(property)
                .rating(reviewRequest.getRating())
                .comment(reviewRequest.getComment())
                .build();

        return ResponseEntity.ok(reviewRepository.save(review));
    }
}
