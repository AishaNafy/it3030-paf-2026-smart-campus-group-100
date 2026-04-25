package com.smartcampus.facilities.repository;

import com.smartcampus.facilities.model.Facility;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class InMemoryFacilityRepository implements FacilityRepository {
    private final Map<String, Facility> store = new ConcurrentHashMap<>();
    private final AtomicLong counter = new AtomicLong(100);

    public InMemoryFacilityRepository() {
        // Pre-populate some data so it doesn't look empty!
        Facility f1 = new Facility();
        f1.setId("FAC-100");
        f1.setName("Main Auditorium");
        f1.setType("Lecture Hall");
        f1.setLocation("Block A, Level 1");
        f1.setCapacity(500);
        f1.setStatus("ACTIVE");
        f1.setAvailabilityWindows("08:00 - 20:00");
        f1.setDescription("Large auditorium with projector and sound system.");
        store.put(f1.getId(), f1);

        Facility f2 = new Facility();
        f2.setId("FAC-101");
        f2.setName("Computer Lab 3");
        f2.setType("Lab");
        f2.setLocation("Block B, Level 3");
        f2.setCapacity(40);
        f2.setStatus("ACTIVE");
        f2.setAvailabilityWindows("08:00 - 18:00");
        f2.setDescription("Equipped with 40 high-end PCs.");
        store.put(f2.getId(), f2);

        Facility f3 = new Facility();
        f3.setId("FAC-102");
        f3.setName("Meeting Room Alpha");
        f3.setType("Meeting Room");
        f3.setLocation("Block A, Level 2");
        f3.setCapacity(10);
        f3.setStatus("MAINTENANCE");
        f3.setAvailabilityWindows("09:00 - 17:00");
        f3.setDescription("Currently AC is under maintenance.");
        store.put(f3.getId(), f3);
        
        Facility f4 = new Facility();
        f4.setId("FAC-103");
        f4.setName("Sony 4K Projector");
        f4.setType("Equipment");
        f4.setLocation("IT Store");
        f4.setCapacity(0);
        f4.setStatus("OUT_OF_SERVICE");
        f4.setAvailabilityWindows("Anytime");
        f4.setDescription("Lens is broken.");
        store.put(f4.getId(), f4);
    }

    @Override
    public List<Facility> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public Optional<Facility> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public Facility save(Facility facility) {
        if (facility.getId() == null || facility.getId().isEmpty()) {
            facility.setId("FAC-" + counter.incrementAndGet());
        }
        store.put(facility.getId(), facility);
        return facility;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }
}
