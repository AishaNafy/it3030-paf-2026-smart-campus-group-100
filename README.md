# Smart Campus Operations Hub
## IT3030 – PAF Assignment 2026

![Smart Campus Banner](https://img.shields.io/badge/Project-Smart_Campus-blue?style=for-the-badge&logo=spring)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

## Project Title - Smart Campus 

### Project Description
The **Smart Campus Operations Hub** is a centralized management system designed to streamline university campus operations. It provides a robust platform for managing campus resources, handling facility bookings, tracking incident reports, and facilitating real-time notifications. The system leverages modern web technologies to ensure efficiency, transparency, and ease of use for students, administrators, and technicians alike.

---

## Team Members

| Name | Student ID | Contribution |
|---|---|---|
| Member 1 | IT23334410 | Resource Management |
| Member 2 | IT23317758 | Booking Management |
| Member 3 | IT23321236 | Incident Ticketing |
| Member 4 | IT23317826 | Notifications + OAuth |

---

## Technologies Used

### Backend
- **Java 17**: Core programming language.
- **Spring Boot 3.2.4**: Enterprise-grade framework for backend logic.
- **Spring Security**: Robust authentication and authorization.
- **Spring Data MongoDB**: Object-document mapping for MongoDB.
- **OAuth 2.0**: Secure third-party authentication via Google.
- **Lombok**: Reducing boilerplate code.
- **Maven**: Dependency management and build tool.

### Frontend
- **React 19**: Modern UI library for a dynamic user experience.
- **Tailwind CSS**: Utility-first CSS framework for premium styling.
- **Axios**: HTTP client for API communication.
- **React Router 7**: client-side routing.
- **Lucide React**: High-quality icon set.
- **Recharts**: Interactive data visualization and dashboards.
- **jsPDF & html2canvas**: Client-side PDF report generation.

---

## System Modules / Features

### 1. Resource Management
- Cataloging and managing campus facilities (Auditoriums, Labs, Meeting Rooms).
- Real-time status tracking (Active, Maintenance, Out of Service).
- Detailed facility descriptions and availability windows.

### 2. Booking Management
- End-to-end booking workflow for students.
- Admin dashboard for approving, rejecting, or modifying reservations.
- Conflict detection and capacity management.

### 3. Incident Ticketing
- Incident reporting system for facility issues (IT, Maintenance, etc.).
- Ticket assignment to specific technicians.
- Status tracking from "Open" to "Resolved" with resolution notes.

### 4. Notifications + OAuth
- Automated email and in-app notifications for booking/ticket updates.
- Secure login using Google OAuth 2.0 or local credentials.
- Role-based access control (RBAC).

---

## Project Structure

```text
PAF_2/
├── backend/                        # Spring Boot Application
│   ├── src/main/java/com/smartcampus/
│   │   ├── auth/                   # Authentication & Security
│   │   │   ├── controller/         # Auth APIs (Login, Register)
│   │   │   ├── model/              # AppUser, Role entities
│   │   │   ├── repository/         # User persistence
│   │   │   └── security/           # OAuth2 & Spring Security configuration
│   │   ├── booking/                # Facility Reservation Logic
│   │   ├── facilities/             # Resource & Facility Management
│   │   ├── tickets/                # Incident Ticketing System
│   │   └── notifications/          # User alerts & Notification services
│   ├── src/main/resources/
│   │   └── application.properties   # Database, OAuth & Server configs
│   └── pom.xml                     # Maven project configuration
├── frontend/                       # React Application
│   ├── src/
│   │   ├── api/                    # Axios configurations & API service hooks
│   │   ├── components/             # Reusable UI components (Modals, Buttons, Layouts)
│   │   ├── pages/                  # Full-page views
│   │   │   ├── AdminDashboard.jsx  # Management console for Admins
│   │   │   ├── Booking/            # Booking module specific pages
│   │   │   ├── LoginPage.jsx       # User authentication portal
│   │   │   └── ...                 # Feature-specific pages (Tickets, Facilities)
│   │   ├── App.js                  # Main Router and Layout wrapper
│   │   └── index.js                # React entry point
│   ├── public/                     # Static assets (images, favicon)
│   ├── package.json                # NPM dependencies and scripts
│   └── tailwind.config.js          # Tailwind CSS design system configuration
└── .github/                        # CI/CD Workflow definitions
```

---

## API Endpoint Summary

| Base Path | Methods | Description |
|:---|:---|:---|
| `/api/auth` | POST, GET | Handles user authentication, login, registration, and session info. |
| `/api/profile` | GET, PUT | Allows users to view and update their own profile information. |
| `/api/admin/users` | GET, POST, PATCH, DELETE | Administrative tools for managing user accounts and assigning roles. |
| `/api/bookings` | GET, POST, PUT, DELETE | Manages facility reservations, status approvals, and deletion logs. |
| `/api/tickets` | GET, POST, PUT, DELETE | Incident management system for reporting and resolving campus issues. |
| `/api/facilities` | GET, POST, PUT, DELETE | Catalog management for campus resources like rooms, labs, and equipment. |
| `/api/notifications` | GET, PATCH, POST | Real-time alerts for ticket updates and booking approval decisions. |
| `/api/reports` | GET | Aggregates data for the dashboard and generates CSV/PDF exports. |
| `/api/comments` | GET, POST, DELETE | Handles discussion threads and updates within specific support tickets. |

---

## Setup Instructions

### Prerequisites
- JDK 17 or higher
- Node.js (v18+) & NPM
- MongoDB Atlas account or local MongoDB instance

### Backend Setup
1. Navigate to the `backend` directory.
2. Update `src/main/resources/application.properties` with your MongoDB URI and OAuth credentials.
3. Build the project:
   ```bash
   mvn clean install
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```

---

## How to Run the Project

### Quick Execution

**Backend:**
```bash
mvn spring-boot:run
```

**Frontend:**
```bash
npm start
```

---

## Authentication

Google OAuth 2.0 is implemented using Spring Security to provide seamless and secure access.

### Roles:
- **ADMIN**: Full system access, management of facilities, bookings, and users.
- **TECHNICIAN**: Access to assigned tickets and resolution management.
- **STUDENT/USER**: Facility booking and incident reporting.

### Default Credentials (Local Login):

| Role | Email | Password |
|:---|:---|:---|
| **Admin** | `admin@gmail.com` | `Admin@123` |
| **Technician** | `aisha@gmail.com` | `aisha123` |
| **Student** | `hirusha@gmail.com` | `12345678` |

---

## Environment Variables

Ensure the following variables are configured in your environment or `application.properties`:

- `SPRING_DATA_MONGODB_URI`: MongoDB connection string.
- `GOOGLE_CLIENT_ID`: Google Cloud Console Client ID.
- `GOOGLE_CLIENT_SECRET`: Google Cloud Console Client Secret.
- `SERVER_PORT`: Port for the backend server (default: 8080).

---

## CI/CD

GitHub Actions is configured for automated pipelines:

- **Build**: Automated compilation of Java and React projects.
- **Test**: Execution of unit and integration tests.
- **Code validation**: Linting and security scans.

---

## Documentation & Testing

- **Screenshots**: [View Project Screenshots (PDF)](./docs/screenshots.pdf)
- **Testing Report**: [View Testing Documentation (PDF)](./docs/testing_report.pdf)

---

## Deployment (Optional)

**Frontend:** [Live Demo Link]  
**Backend:** [API Production URL]

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License & Credits

Distributed under the MIT License. This project is developed as part of the **IT3030 – Platform Application Frameworks (PAF)** module at SLIIT.

**Credits:**
- **SLIIT Faculty of Computing**: For guidance and support.
- **Open Source Community**: For the incredible tools and libraries used in this project.

---
*Created for the IT3030 - Platform Application Frameworks (PAF) Assignment.*
