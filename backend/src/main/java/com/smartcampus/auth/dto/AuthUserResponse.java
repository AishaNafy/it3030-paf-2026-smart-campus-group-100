package com.smartcampus.auth.dto;

import com.smartcampus.auth.model.Role;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthUserResponse {
    String id;
    String email;
    String name;
    String phoneNumber;
    String nic;
    String pictureUrl;
    Role role;
}
