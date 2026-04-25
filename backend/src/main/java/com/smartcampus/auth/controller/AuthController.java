package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.AuthUserResponse;
import com.smartcampus.auth.dto.CreateStudentAccountRequest;
import com.smartcampus.auth.dto.LoginRequest;
import com.smartcampus.auth.model.AppUser;
import com.smartcampus.auth.model.Role;
import com.smartcampus.auth.service.AppUserService;
import com.smartcampus.auth.util.SecurityUtils;
import com.smartcampus.common.exception.BadRequestException;
import com.smartcampus.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AppUserService appUserService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            AppUser user = appUserService.authenticate(request.getEmail(), request.getPassword());
            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            httpRequest.getSession(true).setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            return ResponseEntity.ok(appUserService.toAuthUserResponse(user));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody CreateStudentAccountRequest request) {
        try {
            request.setRole(Role.STUDENT); // Always register as STUDENT
            AppUser user = appUserService.createUserAccount(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(appUserService.toAuthUserResponse(user));
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> getAuthenticatedUser(HttpServletRequest request) {
        try {
            AppUser user = appUserService.getByEmail(SecurityUtils.currentUserEmail());
            syncAuthenticationRole(user, request);
            return ResponseEntity.ok(appUserService.toAuthUserResponse(user));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    private void syncAuthenticationRole(AppUser user, HttpServletRequest request) {
        Authentication current = SecurityContextHolder.getContext().getAuthentication();
        if (current == null || user.getRole() == null) {
            return;
        }

        String expectedAuthority = "ROLE_" + user.getRole().name();
        boolean alreadySynced = current.getAuthorities().stream()
                .anyMatch(authority -> expectedAuthority.equals(authority.getAuthority()));
        if (alreadySynced && current.getAuthorities().size() == 1) {
            return;
        }

        Authentication updatedAuth = new UsernamePasswordAuthenticationToken(
                current.getPrincipal(),
                current.getCredentials(),
                List.of(new SimpleGrantedAuthority(expectedAuthority))
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(updatedAuth);
        SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
    }
}
