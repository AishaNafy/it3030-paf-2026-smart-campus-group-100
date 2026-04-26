package com.smartcampus.auth.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        String rawMsg = exception != null ? exception.getMessage() : "Unknown authentication error";
        String message = rawMsg != null ? rawMsg : "Unknown authentication error";
        String encodedMessage = UriUtils.encode(java.util.Objects.requireNonNull(message), java.util.Objects.requireNonNull(StandardCharsets.UTF_8));
        response.sendRedirect(frontendUrl + "/auth/callback?status=error&message=" + encodedMessage);
    }
}
