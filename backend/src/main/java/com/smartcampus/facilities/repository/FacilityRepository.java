package com.smartcampus.facilities.repository;

import com.smartcampus.facilities.model.Facility;
import java.util.List;

public interface FacilityRepository {
    List<Facility> findAll();
    Facility findById(Long id);
    Facility save(Facility facility);
    void deleteById(Long id);
}
