package com.example.demo.repository;

import com.example.demo.entity.Booking;
import com.example.demo.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByPropertyOwnerId(Long ownerId);
    List<Booking> findByPropertyIdAndStatusIn(Long propertyId, List<BookingStatus> statuses);

    @Query("SELECT b FROM Booking b WHERE b.property.id = :propertyId " +
           "AND b.status IN (:statuses) " +
           "AND b.moveInDate < :moveOutDate AND b.moveOutDate > :moveInDate")
    List<Booking> findOverlappingBookings(
        @Param("propertyId") Long propertyId,
        @Param("moveInDate") LocalDate moveInDate,
        @Param("moveOutDate") LocalDate moveOutDate,
        @Param("statuses") List<BookingStatus> statuses
    );
}
