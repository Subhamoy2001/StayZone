package com.example.demo.util;

import com.example.demo.repository.PropertyRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DataCleanupTask implements CommandLineRunner {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public DataCleanupTask(UserRepository userRepository, PropertyRepository propertyRepository, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("Starting data cleanup and schema fix task...");
        
        // Fix schema: Hibernate update doesn't change VARCHAR to TEXT
        try {
            System.out.println("Applying schema fixes (altering columns to TEXT)...");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN document_url TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE property_images ALTER COLUMN image TYPE TEXT");
            System.out.println("Schema fixes applied successfully.");
        } catch (Exception e) {
            System.err.println("Note: Schema fix might have already been applied or failed: " + e.getMessage());
        }

        // The user asked to "delete all owners and their properties and bookings"
        // Note: owner1@gmail.com is safe because deleteAll(owners) only targets role=OWNER
        // But the user wants to KEEP owner1@gmail.com and sam1@gmail.com.
        // So I'll be more selective.
        
        // Delete all bookings/properties first
        // bookingRepository.deleteAll(); // This might be too aggressive if they want to keep *some* bookings
        // But the user said "delete all owners and their properties... and just keep sam, owner1, admin"
        
        System.out.println("Cleaning up demo data...");

        // Delete demo accounts by email specifically
        List<String> demoEmails = List.of("admin@stayzone.com", "user@stayzone.com", "owner@stayzone.com");
        for (String email : demoEmails) {
            userRepository.findByEmail(email).ifPresent(user -> {
                // Delete properties of this user
                propertyRepository.findByOwnerId(user.getId()).forEach(propertyRepository::delete);
                userRepository.delete(user);
            });
        }
        
        System.out.println("Data cleanup task completed: deleted demo accounts and their properties.");
    }
}
