package com.example.demo.service;

import com.example.demo.entity.Booking;
import com.example.demo.entity.BookingStatus;
import com.example.demo.entity.Property;
import com.example.demo.entity.User;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.PropertyRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public PropertyService(PropertyRepository propertyRepository, UserRepository userRepository, BookingRepository bookingRepository) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Property> getAllApprovedProperties() {
        return propertyRepository.findByIsApprovedTrue();
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    public List<Property> searchProperties(String city, String type) {
        if (city != null && !city.isEmpty()) {
            return propertyRepository.findByCityIgnoreCase(city);
        } else if (type != null && !type.isEmpty()) {
            return propertyRepository.findByTypeIgnoreCase(type);
        }
        return propertyRepository.findByIsApprovedTrue();
    }

    @Transactional
    public Property createProperty(Property property) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User owner = userRepository.findByEmail(email).orElseThrow();
        
        property.setOwner(owner);
        property.setApproved(false); // Requires admin approval
        return propertyRepository.save(property);
    }

    @Transactional
    public Property updateProperty(Long id, Property updatedProperty) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User owner = userRepository.findByEmail(email).orElseThrow();
        
        Property property = getPropertyById(id);
        
        if (!property.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized to edit this property.");
        }
        if (property.isApproved()) {
            throw new RuntimeException("Approved properties cannot be edited directly.");
        }
        
        property.setTitle(updatedProperty.getTitle());
        property.setType(updatedProperty.getType());
        property.setDescription(updatedProperty.getDescription());
        property.setAddress(updatedProperty.getAddress());
        property.setCity(updatedProperty.getCity());
        property.setPrice(updatedProperty.getPrice());
        property.setDeposit(updatedProperty.getDeposit());
        property.setTotalRooms(updatedProperty.getTotalRooms());
        property.setAvailableRooms(updatedProperty.getAvailableRooms());
        property.setAmenities(updatedProperty.getAmenities());
        property.setMapLink(updatedProperty.getMapLink());
        property.setImages(updatedProperty.getImages());

        return propertyRepository.save(property);
    }
    
    public List<Property> getMyProperties() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User owner = userRepository.findByEmail(email).orElseThrow();
        return propertyRepository.findByOwnerId(owner.getId());
    }

    @Transactional
    public void deleteProperty(Long id) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        Property property = getPropertyById(id);
        
        if (!property.getOwner().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Unauthorized to delete this property");
        }

        // Check for active (PENDING or APPROVED) bookings
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> activeBookings = bookingRepository.findByPropertyIdAndStatusIn(id, activeStatuses);
        
        if (!activeBookings.isEmpty()) {
            throw new RuntimeException("Cannot delete this property. It has active or pending bookings.");
        }

        propertyRepository.delete(property);
    }
}
