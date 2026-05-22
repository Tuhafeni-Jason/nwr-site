const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Resort = require('../models/Resort');
const SecurityLog = require('../models/SecurityLog');
require('dotenv').config();

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Booking.deleteMany();
    await Resort.deleteMany();
    await SecurityLog.deleteMany();

    console.log('Data cleared...');

    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@nwr.com',
        password: adminPassword,
        role: 'superadmin',
        isActive: true
      },
      {
        name: 'Security Manager',
        email: 'security@nwr.com',
        password: adminPassword,
        role: 'admin',
        isActive: true
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        role: 'user',
        isActive: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: userPassword,
        role: 'user',
        isActive: true
      }
    ]);

    console.log(`${users.length} users created`);

    // Create resorts
    const resorts = await Resort.create([
      {
        name: 'NWR Grand Resort Maldives',
        location: {
          city: 'Malé',
          country: 'Maldives',
          address: 'North Malé Atoll',
          coordinates: { lat: 4.1755, lng: 73.5093 }
        },
        description: 'Luxury overwater villas in the heart of the Indian Ocean',
        amenities: ['Spa', 'Infinity Pool', 'Water Sports', 'Fine Dining', 'Private Beach'],
        roomTypes: [
          { type: 'Standard', pricePerNight: 350, capacity: 2, available: 20 },
          { type: 'Deluxe', pricePerNight: 550, capacity: 3, available: 15 },
          { type: 'Suite', pricePerNight: 900, capacity: 4, available: 10 },
          { type: 'Villa', pricePerNight: 1500, capacity: 6, available: 5 }
        ],
        rating: 4.8
      },
      {
        name: 'NWR Alpine Lodge',
        location: {
          city: 'Zermatt',
          country: 'Switzerland',
          address: 'Bahnhofstrasse 55',
          coordinates: { lat: 46.0207, lng: 7.7491 }
        },
        description: 'Cozy mountain retreat with stunning Matterhorn views',
        amenities: ['Ski-in/Ski-out', 'Heated Pool', 'Sauna', 'Gourmet Restaurant', 'Fireplace Lounge'],
        roomTypes: [
          { type: 'Standard', pricePerNight: 280, capacity: 2, available: 30 },
          { type: 'Deluxe', pricePerNight: 450, capacity: 3, available: 20 },
          { type: 'Suite', pricePerNight: 750, capacity: 4, available: 8 }
        ],
        rating: 4.6
      },
      {
        name: 'NWR Tokyo Bay Hotel',
        location: {
          city: 'Tokyo',
          country: 'Japan',
          address: '1-1-1 Shibakoen, Minato-ku',
          coordinates: { lat: 35.6586, lng: 139.7454 }
        },
        description: 'Modern luxury in the heart of Tokyo with panoramic city views',
        amenities: ['Rooftop Bar', 'Onsen', 'Fitness Center', 'Business Center', 'Concierge'],
        roomTypes: [
          { type: 'Standard', pricePerNight: 220, capacity: 2, available: 50 },
          { type: 'Deluxe', pricePerNight: 380, capacity: 2, available: 30 },
          { type: 'Suite', pricePerNight: 650, capacity: 3, available: 12 },
          { type: 'Presidential', pricePerNight: 2000, capacity: 4, available: 2 }
        ],
        rating: 4.7
      },
      {
        name: 'NWR Safari Camp',
        location: {
          city: 'Serengeti',
          country: 'Tanzania',
          address: 'Serengeti National Park',
          coordinates: { lat: -2.1540, lng: 34.6857 }
        },
        description: 'Authentic African safari experience with luxury tented accommodation',
        amenities: ['Game Drives', 'Bush Dinners', 'Pool', 'Spa', 'Star Gazing'],
        roomTypes: [
          { type: 'Standard', pricePerNight: 400, capacity: 2, available: 15 },
          { type: 'Deluxe', pricePerNight: 650, capacity: 2, available: 10 },
          { type: 'Villa', pricePerNight: 1200, capacity: 4, available: 4 }
        ],
        rating: 4.9
      }
    ]);

    console.log(`${resorts.length} resorts created`);

    // Create bookings
    const bookings = [];
    const statuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];
    const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Presidential', 'Villa'];
    const sources = ['website', 'mobile_app', 'phone', 'walk-in', 'third_party'];
    const paymentStatuses = ['pending', 'paid', 'refunded', 'failed'];

    const resortNames = resorts.map(r => r.name);

    for (let i = 0; i < 50; i++) {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() - Math.floor(Math.random() * 60));
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 7) + 1);

      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const pricePerNight = [200, 350, 600, 1200, 1800][Math.floor(Math.random() * 5)];

      bookings.push({
        bookingId: `NWR-${Date.now()}-${i}`,
        guestName: `Guest ${i + 1}`,
        guestEmail: `guest${i + 1}@example.com`,
        resort: resortNames[Math.floor(Math.random() * resortNames.length)],
        roomType: roomTypes[Math.floor(Math.random() * roomTypes.length)],
        checkIn,
        checkOut,
        guests: {
          adults: Math.floor(Math.random() * 3) + 1,
          children: Math.floor(Math.random() * 3)
        },
        totalAmount: nights * pricePerNight,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        createdBy: users[Math.floor(Math.random() * users.length)]._id,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
      });
    }

    await Booking.insertMany(bookings);
    console.log(`${bookings.length} bookings created`);

    // Create some security logs
    const securityLogs = [];
    const eventTypes = ['login_success', 'login_failure', 'unauthorized_access', 'suspicious_activity', 'honeypot_triggered'];
    const severities = ['low', 'medium', 'high', 'critical'];

    for (let i = 0; i < 30; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const severity = eventType === 'honeypot_triggered' ? 'critical' : 
                      eventType === 'unauthorized_access' ? 'high' :
                      severities[Math.floor(Math.random() * severities.length)];

      securityLogs.push({
        eventType,
        severity,
        user: Math.random() > 0.5 ? {
          userId: users[Math.floor(Math.random() * users.length)]._id,
          email: `user${i}@example.com`,
          name: `User ${i}`
        } : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0',
        location: {
          country: ['US', 'CN', 'RU', 'BR', 'IN', 'GB'][Math.floor(Math.random() * 6)],
          city: ['New York', 'Beijing', 'Moscow', 'São Paulo', 'Mumbai', 'London'][Math.floor(Math.random() * 6)]
        },
        details: { message: `Security event ${i}` },
        endpoint: ['/api/login', '/api/admin-secret', '/api/bookings'][Math.floor(Math.random() * 3)],
        method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
        threatScore: severity === 'critical' ? 90 : severity === 'high' ? 70 : severity === 'medium' ? 40 : 10,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
      });
    }

    await SecurityLog.insertMany(securityLogs);
    console.log(`${securityLogs.length} security logs created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDefault credentials:');
    console.log('Admin: admin@nwr.com / admin123');
    console.log('User: john@example.com / user123');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
