package com.example.demo.controller;

import com.example.demo.entity.Property;
import com.example.demo.entity.User;
import com.example.demo.entity.Role;
import com.example.demo.entity.Booking;
import com.example.demo.repository.PropertyRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;

    public AdminController(UserRepository userRepository, PropertyRepository propertyRepository, BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/verify")
    public ResponseEntity<User> verifyUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setVerified(true);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/properties/pending")
    public ResponseEntity<List<Property>> getPendingProperties() {
        return ResponseEntity.ok(propertyRepository.findAll().stream()
                .filter(p -> !p.isApproved())
                .toList());
    }

    @PutMapping("/properties/{id}/approve")
    public ResponseEntity<Property> approveProperty(@PathVariable Long id) {
        Property property = propertyRepository.findById(id).orElseThrow();
        property.setApproved(true);
        return ResponseEntity.ok(propertyRepository.save(property));
    }

    @DeleteMapping("/reset-owners")
    @Transactional
    public ResponseEntity<String> resetOwners() {
        // Delete all bookings first (to avoid foreign key constraints)
        bookingRepository.deleteAll();
        
        // Delete all properties (this will also delete @ElementCollection amenities/images)
        propertyRepository.deleteAll();
        
        // Delete all users with role OWNER
        List<User> owners = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.OWNER)
                .toList();
        userRepository.deleteAll(owners);
        
        return ResponseEntity.ok("All owners, properties, and bookings have been deleted.");
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        
        // 1. Delete all bookings made BY this user
        List<Booking> userBookings = bookingRepository.findByUserId(id);
        bookingRepository.deleteAll(userBookings);
        
        // 2. Delete all bookings made FOR properties owned by this user
        List<Booking> propertyBookings = bookingRepository.findByPropertyOwnerId(id);
        bookingRepository.deleteAll(propertyBookings);
        
        // 3. Delete all properties owned by this user
        List<Property> properties = propertyRepository.findByOwnerId(id);
        propertyRepository.deleteAll(properties);
        
        // 4. Finally delete the user
        userRepository.delete(user);
        
        return ResponseEntity.noContent().build();
    }
}
