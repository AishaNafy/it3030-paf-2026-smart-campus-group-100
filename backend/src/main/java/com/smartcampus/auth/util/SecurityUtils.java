package com.smartcampus.auth.util;

import com.smartcampus.common.exception.ForbiddenOperationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String currentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ForbiddenOperationException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User oauth2User) {
            Object email = oauth2User.getAttributes().get("email");
            if (email != null) {
                return email.toString().toLowerCase();
            }
        }
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername().toLowerCase();
        }
        if (principal instanceof String principalText) {
            return principalText.toLowerCase();
        }

        throw new ForbiddenOperationException("Unable to resolve current user");
    }

    public static boolean hasRole(String roleName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        String normalizedRole = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(normalizedRole));
    }
}
