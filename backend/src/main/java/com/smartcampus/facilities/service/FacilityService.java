package com.smartcampus.facilities.service;

import com.smartcampus.facilities.model.Facility;
import java.util.List;

public interface FacilityService {
    List<Facility> getAllFacilities();
    Facility getFacilityById(@org.springframework.lang.NonNull String id);
    Facility createFacility(@org.springframework.lang.NonNull Facility facility);
    Facility updateFacility(@org.springframework.lang.NonNull String id, @org.springframework.lang.NonNull Facility facility);
    void deleteFacility(@org.springframework.lang.NonNull String id);
}
