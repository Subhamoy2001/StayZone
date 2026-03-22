# StayZone 🏠
### Rental Property & PG Booking System

A full-stack web application that connects property owners and tenants — allowing owners to list PGs and rooms, and tenants to search, view, and book properties seamlessly.

---

## 🚀 Live Demo
> _Add your deployed link here (Render / Railway / Vercel)_

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3 |
| Frontend | React.js |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens) |
| API | RESTful APIs |

---

## ✨ Features

### 👤 Tenant
- Register & login securely
- Browse and search available PGs/rooms
- View property details
- Book a room instantly

### 🏢 Owner / Admin
- Add, update, and delete property listings
- Manage bookings from a dedicated dashboard
- Role-based access control (Owner vs Tenant)

---

## 🔐 Security
- JWT-based stateless authentication
- Role-based access control (RBAC) — separate permissions for Owners and Tenants
- Passwords stored securely using BCrypt hashing

---

## 🗄️ Database Design
- Relational schema designed in PostgreSQL
- Optimized queries for property search and booking management
- Entities: Users, Properties, Bookings, Roles

---

## 📁 Project Structure

```
StayZone/
├── backend/          # Spring Boot application
│   ├── controllers/  # REST API endpoints
│   ├── services/     # Business logic
│   ├── repositories/ # Database layer
│   └── security/     # JWT & auth config
└── frontend/         # React.js application
    ├── components/
    ├── pages/
    └── services/     # API calls
```

---

## ⚙️ How to Run Locally

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd backend
# Configure your DB credentials in application.properties
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

> Backend runs on `http://localhost:8080`  
> Frontend runs on `http://localhost:3000`

---

## 📸 Screenshots
> _Add screenshots of your UI here — Login page, Property listing, Booking page, Dashboard_

---

## 👨‍💻 Author
**Subhamoy Basu**  
[LinkedIn](https://linkedin.com/in/subhamoy-basu-6096461a5) • [GitHub](https://github.com/Subhamoy2001)
