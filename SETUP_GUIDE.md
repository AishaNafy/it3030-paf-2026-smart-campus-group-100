# Smart Campus: Incident Ticket Management System
## Complete Setup Guide

This guide will walk you through setting up the Incident Ticket Management System on a new machine. It contains all the necessary prerequisites, environment requirements, and steps to get the full-stack application running smoothly.

---

## 1. Prerequisites (System Requirements)

Before starting, ensure that the following applications are installed on your machine:

### Backend Requirements:
* **Java Development Kit (JDK) 17**: Required to compile and run the Spring Boot application.
  * [Download JDK 17](https://adoptium.net/)
* **Apache Maven**: Required to manage dependencies and build the backend.
  * [Download Maven](https://maven.apache.org/download.cgi)
* **MongoDB**: A MongoDB database. (The current codebase is configured to use your cloud MongoDB Atlas cluster). 

### Frontend Requirements:
* **Node.js**: JavaScript runtime required to run the React development server. (v18 or v20+ recommended).
  * [Download Node.js](https://nodejs.org/)
* **npm**: Node Package Manager (comes bundled with Node.js).

---

## 2. Project Structure

The project repository is split into two primary applications:
* `/backend`: Spring Boot Java application
* `/frontend`: React.js application

---

## 3. Backend Setup & Configuration

1. **Navigate to the Backend directory:**
   Open a terminal and navigate to the backend folder:
   ```bash
   cd path/to/project/backend
   ```

2. **Verify Database Configuration:**
   Open `backend/src/main/resources/application.properties`. Ensure the MongoDB connection string points to your valid cluster.
   ```properties
   # It is currently set to your cloud cluster
   spring.data.mongodb.uri=mongodb+srv://aisha:1234@cluster0.ry1wmxf.mongodb.net/smartcampus_db
   ```

3. **Install Dependencies and Clean the Project:**
   Run the following Maven command to download all `.jar` libraries required by the `pom.xml` (like Spring Web, Data MongoDB, Lombok):
   ```bash
   mvn clean install
   ```

4. **Run the Backend Server:**
   Start the Spring Boot application using the provided maven wrapper command:
   ```bash
   mvn spring-boot:run
   ```
   > The backend will start on **`http://localhost:8080`**. It will automatically create an `uploads/` directory at the project root to store attached images.

---

## 4. Frontend Setup & Configuration

1. **Navigate to the Frontend directory:**
   Open a **new** terminal window and navigate to the frontend folder:
   ```bash
   cd path/to/project/frontend
   ```

2. **Install Node Dependencies:**
   Run the following command to read the `package.json` file and install all necessary JavaScript libraries (React, Tailwind CSS, Axios, Recharts, Lucide Icons, etc.):
   ```bash
   npm install
   ```

3. **Run the Frontend Server:**
   Start the React development server:
   ```bash
   npm start
   ```
   > The frontend will automatically compile and open in your default browser at **`http://localhost:3000`**.

---

## 5. Summary of Key Dependencies

If you ever need to manually verify the core libraries, here they are:

**Backend (`pom.xml`):**
* `spring-boot-starter-web`: Core web capabilities (REST APIs).
* `spring-boot-starter-data-mongodb`: Connects to MongoDB.
* `spring-boot-starter-validation`: Validating incoming request bodies.
* `lombok`: Boilerplate code reduction.

**Frontend (`package.json`):**
* `react` / `react-dom` (^19.x)
* `react-router-dom`: For page navigation.
* `axios`: For making HTTP API requests to the backend.
* `recharts`: For rendering ticket status charts.
* `tailwindcss` (v3.x) & `postcss` & `autoprefixer`: For modern UI styling.
* `lucide-react`: For icon assets.
