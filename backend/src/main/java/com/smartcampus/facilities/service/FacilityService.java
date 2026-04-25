package com.smartcampus.facilities.service;

import com.smartcampus.facilities.model.Facility;
import java.util.List;

public interface FacilityService {
    List<Facility> getAllFacilities();
    Facility getFacilityById(String id);
    Facility createFacility(Facility facility);
    Facility updateFacility(String id, Facility facility);
    void deleteFacility(String id);
}
