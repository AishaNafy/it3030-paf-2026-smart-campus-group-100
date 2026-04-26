package com.smartcampus.auth.security;

import com.smartcampus.auth.model.AppUser;
import com.smartcampus.auth.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RoleSyncFilter extends OncePerRequestFilter {

    private final AppUserRepository appUserRepository;

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication current = SecurityContextHolder.getContext().getAuthentication();
        if (current != null && current.isAuthenticated()) {
            String email = resolveEmail(current.getPrincipal());
            if (email != null && !email.isBlank()) {
                Optional<AppUser> userOptional = appUserRepository.findByEmail(email.toLowerCase());
                if (userOptional.isPresent() && userOptional.get().getRole() != null) {
                    String expectedAuthority = "ROLE_" + userOptional.get().getRole().name();
                    boolean inSync = current.getAuthorities().stream()
                            .anyMatch(authority -> expectedAuthority.equals(authority.getAuthority()));

                    if (!inSync || current.getAuthorities().size() != 1) {
                        Authentication updatedAuth = new UsernamePasswordAuthenticationToken(
                                current.getPrincipal(),
                                current.getCredentials(),
                                List.of(new SimpleGrantedAuthority(expectedAuthority))
                        );
                        if (current.getDetails() != null) {
                            ((UsernamePasswordAuthenticationToken) updatedAuth).setDetails(current.getDetails());
                        }

                        SecurityContext updatedContext = SecurityContextHolder.createEmptyContext();
                        updatedContext.setAuthentication(updatedAuth);
                        SecurityContextHolder.setContext(updatedContext);
                        request.getSession(true).setAttribute(
                                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, updatedContext);
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveEmail(Object principal) {
        if (principal instanceof OAuth2User oauth2User) {
            Object email = oauth2User.getAttributes().get("email");
            return email != null ? email.toString() : null;
        }
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        if (principal instanceof String principalText && !"anonymousUser".equalsIgnoreCase(principalText)) {
            return principalText;
        }
        return null;
    }
}
