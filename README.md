# TaskForge - Role-Driven Work Allocation & Tracking System

TaskForge is a full-stack, production-ready web application built for seamless task allocation, monitoring, and role-based access control.

## 🚀 Tech Stack
- **Frontend:** React.js (Vite), Tailwind CSS, Axios, Context API
- **Backend:** Spring Boot (MVC), Spring Data JPA, Spring Security (JWT)
- **Database:** MySQL
- **Build & Test:** Maven, Postman

---

## 🏗️ Project Structure
```text
Task Forge/
 ├── backend/ (Spring Boot Java Application)
 ├── frontend/ (React Vite Application)
 └── TaskForge_Postman_Collection.json (API Testing Import)
```

---

## 🛠️ Step-by-Step Setup Instructions

### 1. Database Setup (MySQL)
1. Open MySQL Workbench or your terminal.
2. Create a database named `taskforge`:
   ```sql
   CREATE DATABASE taskforge;
   ```
3. Update database credentials in the backend property file located at:
   `backend/src/main/resources/application.properties`
   Replace `root`/`root` with your actual MySQL username and password.

### 2. Backend Setup (Spring Boot)
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   *(Or just run the `TaskforgeApplication.java` file in your IDE like IntelliJ/Eclipse).*
3. **Data Seeding:** On the first startup, an Admin user is automatically created!
   - **Email:** `admin@taskforge.com`
   - **Password:** `admin123`

### 3. Frontend Setup (React)
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local URL (usually `http://localhost:5173`).

---

## 🧪 Testing with Postman
1. Open Postman.
2. Click **Import** > Select `TaskForge_Postman_Collection.json` from the root folder.
3. Call the `Login` route under Auth with the Admin credentials.
4. Copy the received `token`.
5. In Postman, go to the Collection Variables or Environment, and paste the token into the `jwt_token` variable to authenticate all other requests!

---

## 👥 Role Matrix

| Role | Capabilities |
|------|--------------|
| **ADMIN** | Full system overview, Create/Edit/Delete users, Assign Roles (to Managers/Employees). |
| **MANAGER** | Create tasks, assign tasks to Employees, set priorities & deadlines, view team dashboard. |
| **EMPLOYEE** | View personal dashboard, update assigned task status (TODO \to WIP \to DONE), add updates/comments to tasks. |
