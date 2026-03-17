package com.example.demo.config;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@stayzone.com")) {
            User admin = User.builder()
                    .name("Admin System")
                    .email("admin@stayzone.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("1234567890")
                    .role(Role.ADMIN)
                    .isVerified(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Demo Admin seeded. (admin@stayzone.com / admin123)");
        }

        if (!userRepository.existsByEmail("owner@stayzone.com")) {
            User owner = User.builder()
                    .name("Demo Owner")
                    .email("owner@stayzone.com")
                    .password(passwordEncoder.encode("owner123"))
                    .phone("1112223333")
                    .role(Role.OWNER)
                    .isVerified(true) // Assumed verified to add properties
                    .build();
            userRepository.save(owner);
            System.out.println("Demo Owner seeded. (owner@stayzone.com / owner123)");
        }

        if (!userRepository.existsByEmail("user@stayzone.com")) {
            User user = User.builder()
                    .name("Demo Tenant")
                    .email("user@stayzone.com")
                    .password(passwordEncoder.encode("user123"))
                    .phone("4445556666")
                    .role(Role.USER)
                    .isVerified(true)
                    .build();
            userRepository.save(user);
            System.out.println("Demo User seeded. (user@stayzone.com / user123)");
        }
    }
}
