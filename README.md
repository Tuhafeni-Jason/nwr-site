# 🏨 NWR Secure Booking Intelligence System

A full-stack hotel/resort booking management system with advanced cybersecurity features including honeypot detection, threat monitoring, security logging, and intrusion detection.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Git

### 1. Clone & Setup

```bash
git clone "https://github.com/Tuhafeni-Jason/nwr-site.git"
cd nwr-secure-booking
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (already included):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nwr_secure_booking
JWT_SECRET=nwr_secure_booking_intelligence_system_2024
JWT_EXPIRE=24h
NODE_ENV=development
```

Seed the database with demo data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@nwr.com | admin123 |
| Admin | security@nwr.com | admin123 |
| User | john@example.com | user123 |
| User | jane@example.com | user123 |

## 🏗️ Architecture

```
Frontend (React + Tailwind CSS)
    ↓ HTTP/REST API
Backend (Node.js + Express)
    ↓ Mongoose ODM
Database (MongoDB)
```

### Security Layer
- Authentication (JWT)
- Rate Limiting
- Input Sanitization (SQL Injection & XSS)
- Security Headers (Helmet.js)
- Honeypot Detection
- Threat Monitoring & Logging
- Brute Force Protection
- Account Lockout

## 📁 Project Structure

```
nwr-secure-booking/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── security.js           # Security middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Booking.js            # Booking schema
│   │   ├── SecurityLog.js        # Security log schema
│   │   └── Resort.js             # Resort schema
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── bookings.js           # Booking routes
│   │   ├── revenue.js            # Revenue analytics
│   │   ├── security.js           # Security logs & honeypot
│   │   └── admin.js              # Admin panel routes
│   ├── utils/
│   │   ├── securityLogger.js     # Security event logger
│   │   └── seedData.js           # Database seeder
│   ├── server.js                 # Main server file
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js         # Sidebar layout
│   │   │   └── PrivateRoute.js   # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.js    # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.js          # Login page
│   │   │   ├── Dashboard.js      # Main dashboard
│   │   │   ├── Bookings.js       # Booking management
│   │   │   ├── BookingAnalytics.js # Analytics charts
│   │   │   ├── SecurityAlerts.js # Security monitoring
│   │   │   └── AdminPanel.js     # Admin controls
│   │   ├── utils/
│   │   │   └── api.js            # API client
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🔒 Security Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (User, Admin, Superadmin)
- Password hashing with bcrypt
- Account lockout after 5 failed attempts

### 2. Rate Limiting
- General API: 100 requests per 15 minutes
- Login: 5 attempts per 15 minutes
- Automatic brute force detection

### 3. Input Sanitization
- SQL Injection detection
- XSS (Cross-Site Scripting) protection
- Suspicious pattern blocking

### 4. Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- Strict-Transport-Security
- Content Security Policy

### 5. Honeypot Detection
- Fake hidden endpoint: `/api/admin-secret`
- Logs all access attempts
- Triggers critical security alerts
- Threat score calculation

### 6. Security Logging
- Comprehensive event logging
- IP geolocation tracking
- User agent analysis
- Threat score calculation
- Real-time dashboard alerts

### 7. Threat Monitoring
- Severity classification (Low, Medium, High, Critical)
- Automated threat detection
- Geographic threat analysis
- Real-time alert system

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Change password

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/bookings/stats/overview` - Booking statistics

### Revenue
- `GET /api/revenue/dashboard` - Revenue analytics

### Security
- `GET /api/security-logs` - Get security logs
- `GET /api/security-logs/stats` - Security statistics
- `PUT /api/security-logs/:id/resolve` - Resolve event
- `GET /api/security-logs/threats` - Active threats
- `GET /api/admin-secret` - 🍯 HONEYPOT (DO NOT USE)

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Change user role
- `PUT /api/admin/users/:id/status` - Toggle user status

## 🛠️ Technologies

### Frontend
- React 18
- React Router 6
- Tailwind CSS
- Recharts (Charts)
- Lucide React (Icons)
- Axios (HTTP Client)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt.js (Password hashing)
- Helmet (Security headers)
- express-rate-limit (Rate limiting)
- geoip-lite (IP geolocation)

### Security Tools
- OWASP ZAP (Optional)
- Wireshark (Optional)
- Postman (API Testing)

## 📝 Team Roles

| Person | Role | Responsibilities |
|--------|------|-----------------|
| 1 | Frontend/UI Developer | React components, Dashboard, Charts, Styling |
| 2 | Backend/API Developer | Express API, Authentication, Data flow |
| 3 | Database Engineer | MongoDB schema, Data organization, Seeding |
| 4 | Cybersecurity Specialist | Security features, Honeypot, Threat monitoring |
| 5 | Team Lead/Presentation | GitHub, Documentation, Architecture diagrams |

## 🎨 Design Features

- Dark theme with emerald accents
- Glass morphism panels
- Responsive sidebar navigation
- Real-time data visualization
- Animated threat indicators
- Security status badges
- Mobile-responsive design

## 🔧 Development Commands

```bash
# Backend
cd backend
npm run dev        # Start with nodemon
npm start          # Start production
npm run seed       # Seed database

# Frontend
cd frontend
npm start          # Start development server
npm run build      # Build for production
```

## 📄 License

This project is for educational purposes.

---

Built with ❤️ by the NWR Team


# NWR Secure Booking System - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                          │
└──────────────────────┬────────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Dashboard  │  │  Bookings   │  │  Security Alerts    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Login     │  │  Analytics  │  │   Admin Panel       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────┬────────────────────────────────────────┘
                       │ REST API (JSON)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS BACKEND                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Auth     │  │  Bookings   │  │   Security Logs     │  │
│  │   Routes    │  │   Routes    │  │     Routes          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Revenue   │  │    Admin    │  │  Honeypot Handler   │  │
│  │   Routes    │  │   Routes    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   JWT Auth  │  │Rate Limiter │  │  Input Sanitization │  │
│  │  Middleware │  │  Middleware │  │    Middleware       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────┬────────────────────────────────────────┘
                       │ Mongoose ODM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Users    │  │  Bookings   │  │   Security Logs     │  │
│  │ Collection  │  │ Collection  │  │    Collection       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐                                            │
│  │   Resorts   │                                            │
│  │ Collection  │                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

## Security Flow

```
User Request
    │
    ▼
┌─────────────┐
│ Rate Limit  │── Too many? ──► Block + Log
│   Check     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Input     │── Suspicious? ──► Block + Log + Alert
│ Sanitization│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Auth      │── Invalid? ──► Log + Increment counter
│   Check     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Route     │── Honeypot? ──► Critical Alert + Log
│  Handler    │
└──────┬──────┘
       │
       ▼
   Response
```

## Data Models

### User
- name, email, password (hashed)
- role: user | admin | superadmin
- loginAttempts, lockUntil
- lastLogin, isActive

### Booking
- bookingId, guestName, guestEmail
- resort, roomType, checkIn, checkOut
- guests, totalAmount, status
- paymentStatus, source, createdBy

### SecurityLog
- eventType, severity, user
- ipAddress, userAgent, location
- details, endpoint, method
- threatScore, resolved

### Resort
- name, location, description
- amenities, roomTypes
- rating, images, isActive
