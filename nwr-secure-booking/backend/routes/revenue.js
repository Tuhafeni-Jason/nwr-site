const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @route   GET /api/revenue/dashboard
// @desc    Get revenue dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);

    // Today's revenue
    const todayRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Last 7 days revenue
    const weeklyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Last 30 days revenue
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by room type
    const roomTypeRevenue = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$roomType',
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      }
    ]);

    // Revenue by source
    const sourceRevenue = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$source',
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      }
    ]);

    // Payment status distribution
    const paymentStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        todayRevenue: todayRevenue[0]?.total || 0,
        weeklyRevenue,
        monthlyRevenue,
        roomTypeRevenue,
        sourceRevenue,
        paymentStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
