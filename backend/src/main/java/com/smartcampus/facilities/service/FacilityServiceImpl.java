package com.smartcampus.facilities.service;

import com.smartcampus.facilities.model.Facility;
import com.smartcampus.facilities.repository.FacilityRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FacilityServiceImpl implements FacilityService {
    private final FacilityRepository facilityRepository;

    public FacilityServiceImpl(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    @Override
    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    @Override
    public Facility getFacilityById(@org.springframework.lang.NonNull String id) {
        if (id.isBlank()) return null;
        Optional<Facility> optionalFacility = facilityRepository.findById(id);
        return optionalFacility.orElse(null);
    }

    @Override
    public Facility createFacility(@org.springframework.lang.NonNull Facility facility) {
        return facilityRepository.save(facility);
    }

    @Override
    public Facility updateFacility(@org.springframework.lang.NonNull String id, @org.springframework.lang.NonNull Facility facilityDetails) {
        if (id.isBlank()) return null;
        Optional<Facility> optionalFacility = facilityRepository.findById(id);
        if (optionalFacility.isPresent()) {
            Facility facility = optionalFacility.get();
            facility.setName(facilityDetails.getName());
            facility.setType(facilityDetails.getType());
            facility.setLocation(facilityDetails.getLocation());
            facility.setCapacity(facilityDetails.getCapacity());
            facility.setStatus(facilityDetails.getStatus());
            facility.setDescription(facilityDetails.getDescription());
            facility.setAvailabilityWindows(facilityDetails.getAvailabilityWindows());
            return facilityRepository.save(facility);
        }
        return null;
    }

    @Override
    public void deleteFacility(@org.springframework.lang.NonNull String id) {
        if (!id.isBlank()) {
            facilityRepository.deleteById(id);
        }
    }
}
