package com.smartcampus.auth.security;

import com.smartcampus.auth.model.AppUser;
import com.smartcampus.auth.model.Role;
import com.smartcampus.auth.repository.AppUserRepository;
import com.smartcampus.facilities.model.Facility;
import com.smartcampus.facilities.repository.FacilityRepository;
import com.smartcampus.tickets.model.Ticket;
import com.smartcampus.tickets.repository.TicketRepository;
import com.smartcampus.booking.Booking;
import com.smartcampus.booking.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final TicketRepository ticketRepository;
    private final FacilityRepository facilityRepository;
    private final BookingRepository bookingRepository;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.name:Admin}")
    private String adminName;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        // ── 1. Admin User ────────────────────────────────────────────
        String email = adminEmail.toLowerCase();
        AppUser admin = appUserRepository.findByEmail(email).orElseGet(AppUser::new);

        boolean changed = false;
        if (admin.getId() == null) {
            admin.setEmail(email);
            admin.setCreatedAt(LocalDateTime.now());
            changed = true;
        }
        if (admin.getRole() != Role.ADMIN) {
            admin.setRole(Role.ADMIN);
            changed = true;
        }
        if (admin.getName() == null || admin.getName().isBlank()) {
            admin.setName(adminName);
            changed = true;
        }
        if (admin.getPhoneNumber() == null || admin.getPhoneNumber().isBlank()) {
            admin.setPhoneNumber("0000000000");
            changed = true;
        }
        if (admin.getPasswordHash() == null || admin.getPasswordHash().isBlank()) {
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            changed = true;
        }

        if (changed) {
            appUserRepository.save(admin);
            System.out.println("[DataInitializer] Admin user prepared: " + email);
        }

                // ── 2. Sample Student User (seeded for README test accounts) ───
                String studentEmail = "hirusha@gmail.com";
                if (appUserRepository.findByEmail(studentEmail).isEmpty()) {
                        AppUser student = new AppUser();
                        student.setEmail(studentEmail);
                        student.setName("Hirusha Student");
                        student.setPhoneNumber("0771234567");
                        student.setNic("200012345678");
                        student.setPasswordHash(passwordEncoder.encode("12345678"));
                        student.setRole(Role.STUDENT);
                        student.setCreatedAt(LocalDateTime.now());
                        appUserRepository.save(student);
                        System.out.println("[DataInitializer] Sample student created: " + studentEmail);
                }

                // ── 3. Sample Technician User (seeded for README test accounts) ─
                String techEmail = "aisha@gmail.com";
                if (appUserRepository.findByEmail(techEmail).isEmpty()) {
                        AppUser tech = new AppUser();
                        tech.setEmail(techEmail);
                        tech.setName("Aisha Technician");
                        tech.setPhoneNumber("0779876543");
                        tech.setNic("199812345678");
                        tech.setPasswordHash(passwordEncoder.encode("aisha123"));
                        tech.setRole(Role.TECHNICIAN);
                        tech.setCreatedAt(LocalDateTime.now());
                        appUserRepository.save(tech);
                        System.out.println("[DataInitializer] Sample technician created: " + techEmail);
                }

        // ── 4. Sample Tickets ────────────────────────────────────────
        ticketRepository.deleteAll();

        // Use the helper method to create sample tickets
        // Assigned to null means it's unassigned, assigned to techEmail means it's
        // assigned to the technician
        createTicket("Leaking Pipe in Block B",
                "Water is leaking from the ceiling in the 2nd-floor washroom. Needs urgent repair.",
                "Maintenance", "High", "Open", studentEmail, null, null);

        createTicket("Projector Not Working",
                "The projector in Lecture Hall A is not turning on despite multiple attempts.",
                "IT", "Medium", "In Progress", studentEmail, techEmail, "Checking the power supply and VGA cable.");

        createTicket("Broken Chair",
                "One of the chairs in Computer Lab 1 (Lab B) has a broken leg.",
                "Facilities", "Low", "Open", studentEmail, null, null);

        System.out.println("[DataInitializer] 3 sample tickets created.");

        // ── 5. Sample Facilities ─────────────────────────────────────
        if (facilityRepository.count() == 0) {
            createFacility("Main Auditorium", "Lecture Hall", "Block A, Ground Floor", 500,
                    "ACTIVE",
                    "Large auditorium with stage, projector, and sound system. Suitable for events and large lectures.",
                    "08:00 - 20:00 (Mon-Sat)");

            createFacility("Computer Lab 1", "Lab", "Block B, 2nd Floor", 40,
                    "ACTIVE", "Equipped with 40 workstations, high-speed internet, and development tools.",
                    "08:00 - 18:00 (Mon-Fri)");

            createFacility("Computer Lab 2", "Lab", "Block B, 3rd Floor", 35,
                    "MAINTENANCE", "Lab with 35 workstations. Currently undergoing hardware upgrades.",
                    "Temporarily Closed");

            createFacility("Conference Room Alpha", "Meeting Room", "Admin Block, 1st Floor", 20,
                    "ACTIVE", "Air-conditioned meeting room with video conferencing equipment and whiteboard.",
                    "09:00 - 17:00 (Mon-Fri)");

            createFacility("Sports Complex - Gym", "Sports Facility", "Sports Block", 50,
                    "ACTIVE", "Fully equipped gymnasium with cardio and weight training equipment.",
                    "06:00 - 21:00 (Daily)");

            createFacility("Seminar Hall B", "Lecture Hall", "Block C, 1st Floor", 120,
                    "ACTIVE", "Medium-sized hall with projector, AC, and tiered seating arrangement.",
                    "08:00 - 18:00 (Mon-Fri)");

            createFacility("Chemistry Lab", "Lab", "Science Block, Ground Floor", 30,
                    "OUT_OF_SERVICE",
                    "Lab with fume hoods and chemical storage. Currently under renovation due to ventilation issues.",
                    "Closed until further notice");

            createFacility("Basketball Court", "Sports Facility", "Outdoor Sports Area", 30,
                    "ACTIVE", "Full-size outdoor basketball court with floodlights for evening games.",
                    "06:00 - 22:00 (Daily)");

            System.out.println("[DataInitializer] 8 sample facilities created.");
        }

        // ── 6. Sample Bookings ───────────────────────────────────────
        if (bookingRepository.count() == 0) {
            createBooking("B001", studentEmail, "Main Auditorium", "2026-05-05", "09:00", "12:00",
                    "Annual tech symposium opening ceremony", 200, "APPROVED", null);

            createBooking("B002", studentEmail, "Conference Room Alpha", "2026-05-06", "14:00", "16:00",
                    "Group study session for database module", 12, "PENDING", null);

            createBooking("B003", studentEmail, "Computer Lab 1", "2026-05-07", "10:00", "13:00",
                    "Programming workshop for first-year students", 35, "PENDING", null);

            createBooking("B004", studentEmail, "Seminar Hall B", "2026-05-03", "08:00", "10:00",
                    "Guest lecture on cloud computing", 80, "REJECTED", "Hall already reserved for faculty meeting.");

            createBooking("B005", studentEmail, "Sports Complex - Gym", "2026-05-08", "17:00", "19:00",
                    "Fitness club weekly session", 25, "APPROVED", null);

            System.out.println("[DataInitializer] 5 sample bookings created.");
        }
    }

    // ── Helper Methods ───────────────────────────────────────────────

    private void createTicket(String title, String description, String category,
            String priority, String status, String createdBy,
            String assignedTo, String resolutionNotes) {
        Ticket ticket = new Ticket();
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);
        ticket.setCreatedBy(createdBy);
        ticket.setAssignedTo(assignedTo);
        ticket.setResolutionNotes(resolutionNotes);
        ticket.setEmail(createdBy);
        ticket.setPhoneNumber("0771234567");
        ticket.setIncidentDate("2026-04-25");
        ticket.setCreatedAt(LocalDateTime.now().minusDays((long) (Math.random() * 14)));
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    private void createFacility(String name, String type, String location, int capacity,
            String status, String description, String availabilityWindows) {
        Facility facility = new Facility();
        facility.setName(name);
        facility.setType(type);
        facility.setLocation(location);
        facility.setCapacity(capacity);
        facility.setStatus(status);
        facility.setDescription(description);
        facility.setAvailabilityWindows(availabilityWindows);
        facilityRepository.save(facility);
    }

    private void createBooking(String id, String studentId, String location, String date,
            String startTime, String endTime, String purpose,
            int attendees, String status, String rejectionReason) {
        Booking booking = new Booking();
        booking.setId(id);
        booking.setStudentId(studentId);
        booking.setLocation(location);
        booking.setDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(purpose);
        booking.setAttendees(attendees);
        booking.setStatus(status);
        booking.setRejectionReason(rejectionReason);
        booking.setCreatedAt(LocalDateTime.now().minusDays((long) (Math.random() * 7)));
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }
}
