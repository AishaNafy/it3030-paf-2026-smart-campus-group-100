package com.smartcampus.auth.security;

import com.smartcampus.auth.model.AppUser;
import com.smartcampus.auth.model.Role;
import com.smartcampus.auth.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.name:Admin}")
    private String adminName;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        String email = adminEmail.toLowerCase();
        AppUser admin = appUserRepository.findByEmail(email).orElseGet(AppUser::new);

        boolean changed = false;
        if (admin.getId() == null) {
            admin.setEmail(email);
            admin.setCreatedAt(LocalDateTime.now());
            changed = true;
        }
        if (admin.getRole() != Role.ADMIN) {
            admin.setRole(Role.ADMIN);
            changed = true;
        }
        if (admin.getName() == null || admin.getName().isBlank()) {
            admin.setName(adminName);
            changed = true;
        }
        if (admin.getPhoneNumber() == null || admin.getPhoneNumber().isBlank()) {
            admin.setPhoneNumber("0000000000");
            changed = true;
        }
        if (admin.getPasswordHash() == null || admin.getPasswordHash().isBlank()) {
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            changed = true;
        }

        if (changed) {
            appUserRepository.save(admin);
            System.out.println("[DataInitializer] Admin user prepared: " + email);
        }
    }
}
