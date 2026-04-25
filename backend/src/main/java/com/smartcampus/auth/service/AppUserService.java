package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.AuthUserResponse;
import com.smartcampus.auth.dto.CreateStudentAccountRequest;
import com.smartcampus.auth.dto.UpdateProfileRequest;
import com.smartcampus.auth.model.AppUser;
import com.smartcampus.auth.model.Role;
import com.smartcampus.auth.repository.AppUserRepository;
import com.smartcampus.common.exception.BadRequestException;
import com.smartcampus.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private static final String EMAIL_PATTERN = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUser loginOAuthUser(String email, String name, String pictureUrl, String providerId, String provider) {
        String normalizedEmail = normalizeEmail(email);

        AppUser user = appUserRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new OAuth2AuthenticationException(
                        new OAuth2Error("not_registered"),
                        "Your account is not registered. Contact an administrator."));

        user.setName(name);
        user.setPictureUrl(pictureUrl);
        user.setProviderId(providerId);
        user.setProvider(provider);
        user.setLastLoginAt(LocalDateTime.now());

        return appUserRepository.save(user);
    }

    public AppUser createUserAccount(CreateStudentAccountRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        validateGmailEmail(normalizedEmail);
        ensureEmailNotTaken(normalizedEmail);
        Role requestedRole = request.getRole() != null ? request.getRole() : Role.STUDENT;

        AppUser user = new AppUser();
        user.setName(request.getName().trim());
        user.setPhoneNumber(request.getPhoneNumber().trim());
        user.setEmail(normalizedEmail);
        user.setNic(normalizeNic(request.getNic()));
        user.setPasswordHash(passwordEncoder.encode(request.getTemporaryPassword()));
        user.setRole(requestedRole);
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLoginAt(null);
        return appUserRepository.save(user);
    }

    public List<AppUser> getAllUsers() {
        return appUserRepository.findAll();
    }

    public void deleteUser(String id) {
        if (!appUserRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        appUserRepository.deleteById(id);
    }

    public AppUser updateUserRole(String id, Role newRole) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(newRole);
        return appUserRepository.save(user);
    }

    public String getEmailForUser(String nameOrId) {
        if (nameOrId == null || nameOrId.isEmpty()) return null;
        if (nameOrId.contains("@")) return nameOrId.toLowerCase();
        
        return appUserRepository.findByName(nameOrId)
                .map(AppUser::getEmail)
                .orElseGet(() -> appUserRepository.findById(nameOrId)
                        .map(AppUser::getEmail)
                        .orElse(null));
    }

    public AppUser getByEmail(String email) {
        return appUserRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user record not found"));
    }

    public AppUser authenticate(String email, String rawPassword) {
        AppUser user = appUserRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new BadCredentialsException("This account has no password. Contact the administrator.");
        }
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        return appUserRepository.save(user);
    }

    public AppUser updateProfile(String currentEmail, UpdateProfileRequest request) {
        AppUser user = getByEmail(currentEmail);

        user.setName(request.getName().trim());
        user.setPhoneNumber(request.getPhoneNumber().trim());

        if (request.getNic() != null) {
            String nic = request.getNic().trim();
            user.setNic(nic.isBlank() ? null : normalizeNic(nic));
        }

        return appUserRepository.save(user);
    }

    public AuthUserResponse toAuthUserResponse(AppUser user) {
        return AuthUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phoneNumber(user.getPhoneNumber())
                .nic(user.getNic())
                .pictureUrl(user.getPictureUrl())
                .role(user.getRole())
                .build();
    }

    private void validateGmailEmail(String email) {
        if (!email.matches(EMAIL_PATTERN)) {
            throw new BadRequestException("Please enter a valid email address.");
        }
    }

    private void ensureEmailNotTaken(String email) {
        if (appUserRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("A user with this email already exists");
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        return email.trim().toLowerCase();
    }

    private String normalizeNic(String nic) {
        return nic.trim().toUpperCase();
    }
}
