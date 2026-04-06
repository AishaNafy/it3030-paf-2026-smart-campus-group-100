# Smart Campus Operations Hub

Full-stack university project for IT3030 PAF 2026.
The system manages campus facilities, bookings, incident tickets, notifications, and audit logs using a Spring Boot REST API backend, React frontend, and PostgreSQL (or MongoDB).

---

## Tech Stack

- Backend: Spring Boot, Java 17, Maven
- Frontend: React.js, Tailwind CSS, Axios, Recharts
- Database: MongoDB Atlas (or PostgreSQL alternative)
- DevOps / Tools: Node.js, npm, Maven, Git

---

# Smart Campus: Incident Ticket Management System
## Complete Setup Guide

This guide walks you through setting up the Incident Ticket Management System on a new machine.

---

## 1. Prerequisites

### Backend
- Java Development Kit (JDK 17): https://adoptium.net/
- Apache Maven: https://maven.apache.org/download.cgi
- MongoDB (cloud Atlas cluster or local)

### Frontend
- Node.js v18 or v20+: https://nodejs.org/
- npm (bundled with Node.js)

---

## 2. Project Structure

smart-campus/
├── backend/      # Spring Boot Java application
└── frontend/     # React.js frontend

---

## 3. Backend Setup

cd path/to/project/backend

# Verify MongoDB configuration in backend/src/main/resources/application.properties
# Example:
# spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster0.qeyf8hi.mongodb.net/ticketdb?appName=Cluster0

mvn clean install
mvn spring-boot:run
# Backend runs at http://localhost:8080, uploads/ folder created automatically

---

## 4. Frontend Setup

cd path/to/project/frontend
npm install
npm start
# Frontend runs at http://localhost:3000

---

## 5. Key Dependencies

# Backend (pom.xml):
- spring-boot-starter-web
- spring-boot-starter-data-mongodb
- spring-boot-starter-validation
- lombok

# Frontend (package.json):
- react / react-dom (^19.x)
- react-router-dom
- axios
- recharts
- tailwindcss, postcss, autoprefixer
- lucide-react

---

## 6. Notes

- Ensure backend is running before frontend.
- Replace <username> and <password> in MongoDB URI.
- Test API endpoints via Postman or frontend.
- Supports incident ticket management, campus maintenance, notifications.

---

## 7. Member Contributions

- **Member 1:** Facilities catalogue + resource management endpoints - IT23317758 - O G H P Bandara  
- **Member 2:** Booking workflow + conflict checking - IT23334410 - I D I R Jayasinghe  
- **Member 3:** Incident tickets + attachments + technician updates - IT23321236 - Nafy F A  
- **Member 4:** Notifications + role management + OAuth integration improvements - IT23317826 - W M K Gayantha  

---

## 8. Contributions

git checkout -b feature/xyz
git commit -m 'Add xyz'
git push origin feature/xyz
# Open pull request

---

## 9. License

MIT License © 2026
" > README.md
