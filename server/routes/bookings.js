import express from 'express';
import Booking from '../models/Booking.js';
import Guide from '../models/Guide.js';
import Message from '../models/Message.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// POST /api/bookings
router.post('/', protect, restrictTo('tourist'), async (req, res) => {
  try {
    const { guideId, date, time, duration, location, notes } = req.body;
    if (!guideId || !date || !time || !duration || !location) {
      return res.status(400).json({ message: 'guideId, date, time, duration, and location are required' });
    }
    const guide = await Guide.findById(guideId);
    if (!guide) return res.status(404).json({ message: 'Guide not found' });
    const totalPrice = guide.hourlyRate * Number(duration);
    const booking = await Booking.create({
      tourist: req.user.id,
      guide: guideId,
      date,
      time,
      duration: Number(duration),
      location,
      notes: notes || '',
      totalPrice,
    });
    await booking.populate([
      { path: 'tourist', select: 'name email' },
      { path: 'guide', populate: { path: 'user', select: 'name' } },
    ]);
    
    // Send automated chat message
    const autoMsg = await Message.create({
      booking: booking._id,
      sender: req.user.id,
      receiver: guide.user,
      content: `I have requested a booking for ${date} at ${time}.`,
      isAutoMsg: true
    });
    
    const io = req.app.get('io');
    if (io) io.to(booking._id.toString()).emit('new_message', autoMsg);

    res.status(201).json(booking);
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// GET /api/bookings/my
router.get('/my', protect, restrictTo('tourist'), async (req, res) => {
  try {
    const bookings = await Booking.find({ tourist: req.user.id })
      .populate({ path: 'guide', populate: { path: 'user', select: 'name avatar' } })
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    console.error('Get my bookings error:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/guide
router.get('/guide', protect, restrictTo('guide'), async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.id });
    if (!guide) return res.status(404).json({ message: 'Guide profile not found' });
    const bookings = await Booking.find({ guide: guide._id })
      .populate('tourist', 'name email avatar')
      .sort({ date: 1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    console.error('Get guide bookings error:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/all
router.get('/all', protect, restrictTo('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('tourist', 'name email')
      .populate({ path: 'guide', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    console.error('Admin get bookings error:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// PATCH /api/bookings/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending_advance', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role === 'guide') {
      const guide = await Guide.findOne({ user: req.user.id });
      if (!guide || booking.guide.toString() !== guide._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this booking' });
      }
      // Guide can accept to 'pending_advance', or mark 'completed' (maybe after tour)
    }
    if (req.user.role === 'tourist') {
      if (booking.tourist.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (status !== 'cancelled' && status !== 'completed') {
        return res.status(403).json({ message: 'Tourists can only cancel or mark completed' });
      }
    }
    booking.status = status;
    await booking.save();

    // Auto messages logic
    if (status === 'pending_advance') {
      const autoMsg = await Message.create({
        booking: booking._id,
        sender: req.user.id, // guide
        receiver: booking.tourist,
        content: `I have accepted your booking request. Please pay the 50% advance to confirm.`,
        isAutoMsg: true
      });
      const io = req.app.get('io');
      if (io) io.to(booking._id.toString()).emit('new_message', autoMsg);
    } else if (status === 'completed') {
      const autoMsg = await Message.create({
        booking: booking._id,
        sender: req.user.id,
        receiver: req.user.role === 'guide' ? booking.tourist : booking.guide, // It might be guide user id, need to verify
        content: `Tour marked as completed. Please finalize the remaining payment.`,
        isAutoMsg: true
      });
      const io = req.app.get('io');
      if (io) io.to(booking._id.toString()).emit('new_message', autoMsg);
    }
    
    res.json({ message: `Booking ${status}`, booking });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ message: 'Failed to update booking' });
  }
});

export default router;
