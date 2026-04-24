package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.AuthUserResponse;
import com.smartcampus.auth.dto.UpdateProfileRequest;
import com.smartcampus.auth.model.AppUser;
import com.smartcampus.auth.service.AppUserService;
import com.smartcampus.auth.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AppUserService appUserService;

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> getMyProfile() {
        AppUser user = appUserService.getByEmail(SecurityUtils.currentUserEmail());
        return ResponseEntity.ok(appUserService.toAuthUserResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<AuthUserResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        AppUser updated = appUserService.updateProfile(SecurityUtils.currentUserEmail(), request);
        return ResponseEntity.ok(appUserService.toAuthUserResponse(updated));
    }
}
