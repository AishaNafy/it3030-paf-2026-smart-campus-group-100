package com.smartcampus.facilities;

import com.smartcampus.facilities.repository.FacilityRepository;
import com.smartcampus.facilities.repository.InMemoryFacilityRepository;
import com.smartcampus.facilities.service.FacilityService;
import com.smartcampus.facilities.service.FacilityServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FacilityConfig {
    @Bean
    public FacilityRepository facilityRepository() {
        return new InMemoryFacilityRepository();
    }

    @Bean
    public FacilityService facilityService(FacilityRepository facilityRepository) {
        return new FacilityServiceImpl(facilityRepository);
    }
}