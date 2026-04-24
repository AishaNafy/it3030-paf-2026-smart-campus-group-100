package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.AuthUserResponse;
import com.smartcampus.auth.dto.CreateStudentAccountRequest;
import com.smartcampus.auth.model.AppUser;
import com.smartcampus.auth.service.AppUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final AppUserService appUserService;

    @GetMapping
    public ResponseEntity<List<AuthUserResponse>> getAllUsers() {
        List<AuthUserResponse> users = appUserService.getAllUsers().stream()
                .map(appUserService::toAuthUserResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<AuthUserResponse> createUserAccount(
            @Valid @RequestBody CreateStudentAccountRequest request
    ) {
        AppUser user = appUserService.createUserAccount(request);
        return ResponseEntity.ok(appUserService.toAuthUserResponse(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        appUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
