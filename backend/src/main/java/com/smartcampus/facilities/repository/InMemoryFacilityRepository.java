package com.smartcampus.facilities.repository;

import com.smartcampus.facilities.model.Facility;
import java.util.*;

public class InMemoryFacilityRepository implements FacilityRepository {
    private final Map<Long, Facility> facilities = new HashMap<>();
    private long nextId = 1;

    @Override
    public List<Facility> findAll() {
        return new ArrayList<>(facilities.values());
    }

    @Override
    public Facility findById(Long id) {
        return facilities.get(id);
    }

    @Override
    public Facility save(Facility facility) {
        if (facility.getId() == null) {
            facility.setId(nextId++);
        }
        facilities.put(facility.getId(), facility);
        return facility;
    }

    @Override
    public void deleteById(Long id) {
        facilities.remove(id);
    }
}
