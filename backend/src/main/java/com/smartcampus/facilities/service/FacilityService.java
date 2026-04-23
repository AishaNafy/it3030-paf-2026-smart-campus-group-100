package com.smartcampus.facilities.service;

import com.smartcampus.facilities.model.Facility;
import java.util.List;

public interface FacilityService {
    List<Facility> getAllFacilities();
    Facility getFacilityById(Long id);
    Facility createFacility(Facility facility);
    void deleteFacility(Long id);
}
