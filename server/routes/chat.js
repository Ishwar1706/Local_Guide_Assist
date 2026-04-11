import express from 'express';
import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/chat/booking/:bookingId
// Get all messages for a specific booking
router.get('/booking/:bookingId', protect, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('tourist guide');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Auth check
    const isTourist = booking.tourist._id.toString() === req.user.id;
    const isGuide = booking.guide.user.toString() === req.user.id;
    if (!isTourist && !isGuide) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ booking: bookingId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Fetch chats error:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// GET /api/chat/my
// Returns booking conversations + direct message threads for the sidebar
router.get('/my', protect, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const Guide = (await import('../models/Guide.js')).default;

    // ─── 1. Booking-based conversations ───────────────────────────────────
    let bookings = [];
    if (req.user.role === 'tourist') {
      bookings = await Booking.find({ tourist: req.user.id })
        .populate({ path: 'guide', populate: { path: 'user', select: 'name email avatar' } });
    } else if (req.user.role === 'guide') {
      const guide = await Guide.findOne({ user: req.user.id });
      if (guide) {
        bookings = await Booking.find({ guide: guide._id })
          .populate('tourist', 'name email avatar');
      }
    }

    const bookingConvs = bookings.map(b => {
      let otherParty;
      if (req.user.role === 'tourist') {
        const g = b.guide;
        otherParty = {
          _id: g?._id,
          userId: g?.user?._id?.toString(),
          name: g?.user?.name || 'Guide',
          email: g?.user?.email || '',
          phone: g?.phone || '',
          avatar: g?.avatar || g?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(g?.user?.name || 'Guide')}&background=3b82f6&color=fff`,
        };
      } else {
        const t = b.tourist;
        otherParty = {
          _id: t?._id?.toString(),
          userId: t?._id?.toString(),
          name: t?.name || 'Tourist',
          email: t?.email || '',
          avatar: t?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t?.name || 'Tourist')}&background=e2e8f0`,
        };
      }
      return { _id: b._id, date: b.date, status: b.status, isDirect: false, otherParty };
    });

    // ─── 2. Direct message conversations (booking: null) ──────────────────
    // Find all direct messages involving this user
    const directMsgs = await Message.find({
      $or: [{ booking: null }, { booking: { $exists: false } }],
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    }).sort({ createdAt: -1 }); // newest first

    // Get unique "other user" IDs from direct messages
    const seenUserIds = new Set();
    const directConvs = [];

    for (const msg of directMsgs) {
      const otherUserId = msg.sender.toString() === req.user.id
        ? msg.receiver.toString()
        : msg.sender.toString();

      if (seenUserIds.has(otherUserId)) continue;
      seenUserIds.add(otherUserId);

      // Skip if this person already has a booking conv (avoid duplicates)
      const alreadyInBooking = bookingConvs.some(
        c => c.otherParty?.userId?.toString() === otherUserId
      );
      if (alreadyInBooking) continue;

      // Fetch user info for the other party
      const otherUser = await User.findById(otherUserId).select('name email avatar role').lean();
      if (!otherUser) continue;

      // If the other user is a guide, also fetch their guide profile for phone/avatar
      let guideProfile = null;
      if (otherUser.role === 'guide') {
        guideProfile = await Guide.findOne({ user: otherUserId }).select('avatar phone').lean();
      }

      directConvs.push({
        _id: `direct_${otherUserId}`,   // Virtual ID for frontend
        isDirect: true,
        status: 'direct',
        date: msg.createdAt?.toISOString?.()?.split('T')[0] || '',
        otherParty: {
          _id: otherUserId,
          userId: otherUserId,
          name: otherUser.name || 'User',
          email: otherUser.email || '',
          phone: guideProfile?.phone || '',
          avatar: guideProfile?.avatar || otherUser.avatar
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name || 'User')}&background=3b82f6&color=fff`,
        },
      });
    }

    // ─── 3. Merge and return ───────────────────────────────────────────────
    res.json([...bookingConvs, ...directConvs]);
  } catch (err) {
    console.error('Fetch my chats error:', err.message || err);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// POST /api/chat/send
// bookingId is optional for direct/pre-booking messages.
router.post('/send', protect, async (req, res) => {
  try {
    const { bookingId, receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'receiverId and content are required' });
    }

    // Build message data — only include booking if a valid bookingId was provided
    const msgData = {
      sender: req.user.id,
      receiver: receiverId,
      content: content.trim(),
    };
    if (bookingId && bookingId !== 'null') {
      msgData.booking = bookingId;
    }

    const msg = await Message.create(msgData);
    res.status(201).json(msg);
  } catch (err) {
    console.error('Send msg error:', err.message || err);
    res.status(500).json({ message: err.message || 'Failed to send message' });
  }
});

// GET /api/chat/direct/:otherUserId
// Get all direct (non-booking) messages between current user and another user
router.get('/direct/:otherUserId', protect, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const messages = await Message.find({
      $or: [{ booking: null }, { booking: { $exists: false } }],
      $and: [
        {
          $or: [
            { sender: req.user.id, receiver: otherUserId },
            { sender: otherUserId, receiver: req.user.id },
          ],
        },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Direct chat fetch error:', err.message || err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

export default router;
