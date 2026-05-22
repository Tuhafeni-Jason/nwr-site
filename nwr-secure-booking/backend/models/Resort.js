const mongoose = require('mongoose');

const resortSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    city: String,
    country: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  description: {
    type: String
  },
  amenities: [{
    type: String
  }],
  roomTypes: [{
    type: { type: String },
    pricePerNight: Number,
    capacity: Number,
    available: { type: Number, default: 0 }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resort', resortSchema);
