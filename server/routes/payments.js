import express from 'express';
import { randomBytes } from 'crypto';
import Booking from '../models/Booking.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// POST /api/payments/initiate
router.post('/initiate', protect, restrictTo('tourist'), async (req, res) => {
  try {
    const { bookingId, paymentType } = req.body; // 'advance' or 'final'
    if (!bookingId || !paymentType) return res.status(400).json({ message: 'bookingId and paymentType are required' });
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.tourist.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (paymentType === 'advance' && booking.paymentStatus !== 'unpaid') {
      return res.status(400).json({ message: 'Advance already paid or booking not unpaid' });
    }
    if (paymentType === 'final' && booking.paymentStatus !== 'advance_paid') {
      return res.status(400).json({ message: 'Booking is not pending final payment' });
    }

    const orderId = `ORDER_${randomBytes(8).toString('hex').toUpperCase()}`;
    const amountToPay = booking.totalPrice / 2; // 50% payment

    res.json({ orderId, amount: amountToPay, currency: 'INR', bookingId, paymentType });
  } catch (err) {
    console.error('Payment initiate error:', err);
    res.status(500).json({ message: 'Failed to initiate payment' });
  }
});

// POST /api/payments/verify
router.post('/verify', protect, restrictTo('tourist'), async (req, res) => {
  try {
    const { bookingId, orderId, paymentType } = req.body;
    if (!bookingId || !orderId || !paymentType) {
      return res.status(400).json({ message: 'bookingId, orderId, and paymentType required' });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.tourist.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const paymentId = `PAY_${randomBytes(10).toString('hex').toUpperCase()}`;
    
    if (paymentType === 'advance') {
      booking.paymentStatus = 'advance_paid';
      booking.status = 'confirmed'; // Booking is officially confirmed after advance
    } else if (paymentType === 'final') {
      booking.paymentStatus = 'fully_paid';
      booking.paymentId = paymentId; // Store final payment ID
    }

    await booking.save();
    
    res.json({
      success: true,
      paymentId,
      message: paymentType === 'advance' ? 'Advance Payment Successful! Booking Confirmed.' : 'Final Payment Successful!',
      booking,
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

export default router;
