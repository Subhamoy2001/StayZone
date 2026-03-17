package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User owner;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type; // PG, Apartment, Flat, Independent House

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Double deposit;

    @Column(name = "total_rooms")
    private Integer totalRooms;

    @Column(name = "available_rooms")
    private Integer availableRooms;

    @Column(name = "map_link")
    private String mapLink;

    @ElementCollection
    @CollectionTable(name = "property_amenities", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "amenity")
    private List<String> amenities;

    @ElementCollection
    @CollectionTable(name = "property_images", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "image", columnDefinition = "TEXT")
    private List<String> images;

    @Builder.Default
    @Column(name = "is_approved", nullable = false)
    private boolean isApproved = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
