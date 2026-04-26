package com.smartcampus.facilities.controller;

import com.smartcampus.facilities.model.Facility;
import com.smartcampus.facilities.service.FacilityService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {
    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    public List<Facility> getAllFacilities() {
        return facilityService.getAllFacilities();
    }

    @GetMapping("/{id}")
    public Facility getFacilityById(@PathVariable @org.springframework.lang.NonNull String id) {
        return facilityService.getFacilityById(id);
    }

    @PostMapping
    public Facility createFacility(@RequestBody @org.springframework.lang.NonNull Facility facility) {
        return facilityService.createFacility(facility);
    }

    @PutMapping("/{id}")
    public Facility updateFacility(@PathVariable @org.springframework.lang.NonNull String id, @RequestBody @org.springframework.lang.NonNull Facility facility) {
        return facilityService.updateFacility(id, facility);
    }

    @DeleteMapping("/{id}")
    public void deleteFacility(@PathVariable @org.springframework.lang.NonNull String id) {
        facilityService.deleteFacility(id);
    }
}
