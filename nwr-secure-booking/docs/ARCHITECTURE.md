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
