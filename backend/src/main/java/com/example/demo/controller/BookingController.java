package com.example.demo.controller;

import com.example.demo.dto.BookingRequest;
import com.example.demo.entity.Booking;
import com.example.demo.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<Booking>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @GetMapping("/owner-requests")
    public ResponseEntity<List<Booking>> getOwnerBookingRequests() {
        return ResponseEntity.ok(bookingService.getOwnerBookingRequests());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }
}
