package com.example.demo.controller;

import com.example.demo.entity.Property;
import com.example.demo.service.PropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type) {
        if (city != null || type != null) {
            return ResponseEntity.ok(propertyService.searchProperties(city, type));
        }
        return ResponseEntity.ok(propertyService.getAllApprovedProperties());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @PostMapping
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        return ResponseEntity.ok(propertyService.createProperty(property));
    }

    @GetMapping("/my-properties")
    public ResponseEntity<List<Property>> getMyProperties() {
        return ResponseEntity.ok(propertyService.getMyProperties());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(@PathVariable Long id, @RequestBody Property property) {
        return ResponseEntity.ok(propertyService.updateProperty(id, property));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }
}
