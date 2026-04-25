package com.smartcampus.facilities.repository;

import com.smartcampus.facilities.model.Facility;
import java.util.List;
import java.util.Optional;

public interface FacilityRepository {
    List<Facility> findAll();
    Optional<Facility> findById(String id);
    Facility save(Facility facility);
    void deleteById(String id);
}
