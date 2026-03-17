package com.example.demo.controller;

import com.example.demo.entity.Property;
import com.example.demo.entity.User;
import com.example.demo.entity.Wishlist;
import com.example.demo.repository.PropertyRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WishlistRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    public WishlistController(WishlistRepository wishlistRepository, UserRepository userRepository, PropertyRepository propertyRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
    }

    @GetMapping
    public ResponseEntity<List<Wishlist>> getMyWishlist() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(wishlistRepository.findByUserId(user.getId()));
    }

    @PostMapping("/{propertyId}")
    public ResponseEntity<Wishlist> toggleWishlist(@PathVariable Long propertyId) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        if (wishlistRepository.existsByUserIdAndPropertyId(user.getId(), propertyId)) {
            // Un-wishlist
            deleteWishlistItem(user.getId(), propertyId);
            return ResponseEntity.ok().build();
        } else {
            // Wishlist
            Property property = propertyRepository.findById(propertyId).orElseThrow();
            Wishlist w = Wishlist.builder()
                    .user(user)
                    .property(property)
                    .build();
            return ResponseEntity.ok(wishlistRepository.save(w));
        }
    }
    
    @Transactional
    public void deleteWishlistItem(Long userId, Long propertyId) {
        wishlistRepository.deleteByUserIdAndPropertyId(userId, propertyId);
    }
}
