package com.smartcampus.auth.service;

import com.smartcampus.auth.model.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final AppUserService appUserService;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = delegate.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");
        String providerId = oauth2User.getAttribute("sub");
        String provider = userRequest.getClientRegistration().getRegistrationId();

        AppUser appUser = appUserService.loginOAuthUser(email, name, picture, providerId, provider);

        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + appUser.getRole().name());
        Map<String, Object> mappedAttributes = new HashMap<>(oauth2User.getAttributes());
        mappedAttributes.put("appRole", appUser.getRole().name());

        return new DefaultOAuth2User(List.of(authority), mappedAttributes, "email");
    }
}
