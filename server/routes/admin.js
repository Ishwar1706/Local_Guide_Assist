import express from 'express';
import User from '../models/User.js';
import Guide from '../models/Guide.js';
import Booking from '../models/Booking.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/users
router.get('/users', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// GET /api/admin/stats
router.get('/stats', protect, restrictTo('admin'), async (req, res) => {
  try {
    const [totalUsers, totalGuides, totalBookings, pendingVerification] = await Promise.all([
      User.countDocuments(),
      Guide.countDocuments(),
      Booking.countDocuments(),
      Guide.countDocuments({ isVerified: false }),
    ]);
    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    res.json({
      totalUsers,
      totalGuides,
      totalBookings,
      pendingVerification,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// PATCH /api/admin/guides/:id/verify
router.patch('/guides/:id/verify', protect, restrictTo('admin'), async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!guide) return res.status(404).json({ message: 'Guide not found' });
    res.json({ message: 'Guide verified', guide });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify guide' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default router;
