package com.example.demo.service;

import com.example.demo.dto.BookingRequest;
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

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, PropertyRepository propertyRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    public Booking createBooking(BookingRequest request) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.isApproved()) {
            throw new RuntimeException("Property is not approved yet");
        }

        if (request.getMoveOutDate() == null || !request.getMoveOutDate().isAfter(request.getMoveInDate())) {
            throw new RuntimeException("Move-out date must be after move-in date");
        }

        // Check for overlapping APPROVED or PENDING bookings
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                request.getPropertyId(),
                request.getMoveInDate(),
                request.getMoveOutDate(),
                activeStatuses
        );

        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Property is already booked for the selected dates. Please choose different dates.");
        }

        Booking booking = Booking.builder()
                .user(user)
                .property(property)
                .moveInDate(request.getMoveInDate())
                .moveOutDate(request.getMoveOutDate())
                .status(BookingStatus.PENDING)
                .totalAmount(property.getPrice() + property.getDeposit())
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();
        return bookingRepository.findByUserId(user.getId());
    }

    public List<Booking> getOwnerBookingRequests() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User owner = userRepository.findByEmail(email).orElseThrow();
        return bookingRepository.findByPropertyOwnerId(owner.getId());
    }

    public Booking approveBooking(Long bookingId) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User owner = userRepository.findByEmail(email).orElseThrow();

        Booking booking = bookingRepository.findById(bookingId).orElseThrow();

        if (!booking.getProperty().getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized to approve this booking");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }
}
