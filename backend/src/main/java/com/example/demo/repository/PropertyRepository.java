package com.example.demo.repository;

import com.example.demo.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByCityIgnoreCase(String city);
    List<Property> findByTypeIgnoreCase(String type);
    List<Property> findByOwnerId(Long ownerId);
    List<Property> findByIsApprovedTrue();
}
