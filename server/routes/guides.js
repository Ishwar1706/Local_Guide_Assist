import express from 'express';
import Guide from '../models/Guide.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Helper function to check if two time slots overlap
function timeSlotsOverlap(start1, duration1, start2, duration2) {
  const end1 = start1 + duration1;
  const end2 = start2 + duration2;
  return start1 < end2 && start2 < end1;
}

// GET /api/guides
router.get('/', async (req, res) => {
  try {
    const { search, location, language, minRate, maxRate, state, city, date, time, duration } = req.query;
    let guideFilter = {};
    if (location) guideFilter.location = { $regex: location, $options: 'i' };
    if (state) guideFilter.state = { $regex: state, $options: 'i' };
    if (city) guideFilter.city = { $regex: city, $options: 'i' };
    if (language) guideFilter.languages = { $in: [new RegExp(language, 'i')] };
    if (minRate) guideFilter.hourlyRate = { ...guideFilter.hourlyRate, $gte: Number(minRate) };
    if (maxRate) guideFilter.hourlyRate = { ...guideFilter.hourlyRate, $lte: Number(maxRate) };

    let guides = await Guide.find(guideFilter).populate('user', 'name email avatar').lean();

    if (search) {
      const term = search.toLowerCase();
      guides = guides.filter(
        (g) =>
          g.user?.name?.toLowerCase().includes(term) ||
          g.bio?.toLowerCase().includes(term) ||
          g.specialties?.some((s) => s.toLowerCase().includes(term))
      );
    }

    // Filter out guides with conflicting bookings if date, time, duration provided
    if (date && time && duration) {
      const [bh, bm] = time.split(':').map(Number);
      const bookingStartMin = bh * 60 + bm;
      const dur = Number(duration);
      const conflictingGuideIds = new Set();
      const conflictingBookings = await Booking.find({
        date,
        status: { $in: ['requested', 'pending_advance', 'confirmed'] }
      }).select('guide time duration');
      for (const cb of conflictingBookings) {
        const [eh, em] = cb.time.split(':').map(Number);
        const eStartMin = eh * 60 + em;
        if (timeSlotsOverlap(bookingStartMin, dur * 60, eStartMin, cb.duration * 60)) {
          conflictingGuideIds.add(cb.guide.toString());
        }
      }
      guides = guides.filter(g => !conflictingGuideIds.has(g._id.toString()));
    }

    const formatted = guides.map((g) => ({
      id: g._id,
      userId: g.user?._id,
      name: g.user?.name || 'Unknown',
      email: g.user?.email,
      phone: g.phone || '',
      avatar: g.avatar || g.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.user?.name || 'Guide')}&background=3b82f6&color=fff`,
      bio: g.bio,
      location: g.location,
      state: g.state,
      city: g.city,
      languages: g.languages,
      specialties: g.specialties,
      hourlyRate: g.hourlyRate,
      rating: g.rating,
      totalReviews: g.totalReviews,
      isVerified: g.isVerified,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Get guides error:', err);
    res.status(500).json({ message: 'Failed to fetch guides' });
  }
});

// GET /api/guides/my/profile
router.get('/my/profile', protect, restrictTo('guide'), async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.id }).populate('user', 'name email avatar').lean();
    if (!guide) return res.status(404).json({ message: 'Guide profile not found' });
    res.json({
      id: guide._id,
      name: guide.user?.name,
      email: guide.user?.email,
      avatar: guide.avatar || guide.user?.avatar || '',
      bio: guide.bio,
      location: guide.location,
      languages: guide.languages,
      specialties: guide.specialties,
      hourlyRate: guide.hourlyRate,
      rating: guide.rating,
      totalReviews: guide.totalReviews,
      isVerified: guide.isVerified,
      availability: guide.availability,
      reviews: guide.reviews.map((r) => ({
        tourist: r.tourist,
        touristName: r.touristName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error('Get my profile error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// GET /api/guides/:id
router.get('/:id', async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('reviews.tourist', 'name avatar')
      .lean();
    if (!guide) return res.status(404).json({ message: 'Guide not found' });
    res.json({
      id: guide._id,
      userId: guide.user?._id,
      name: guide.user?.name || 'Unknown',
      email: guide.user?.email,
      phone: guide.phone || '',
      avatar: guide.avatar || guide.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.user?.name || 'Guide')}&background=3b82f6&color=fff`,
      bio: guide.bio,
      location: guide.location,
      state: guide.state,
      city: guide.city,
      languages: guide.languages,
      specialties: guide.specialties,
      hourlyRate: guide.hourlyRate,
      rating: guide.rating,
      totalReviews: guide.totalReviews,
      reviews: guide.reviews,
      isVerified: guide.isVerified,
      availability: guide.availability,
    });
  } catch (err) {
    console.error('Get guide error:', err);
    res.status(500).json({ message: 'Failed to fetch guide' });
  }
});

// PUT /api/guides/my/profile
router.put('/my/profile', protect, restrictTo('guide'), async (req, res) => {
  try {
    const { bio, location, state, city, languages, specialties, hourlyRate, availability, avatar, phone } = req.body;
    const guide = await Guide.findOne({ user: req.user.id });
    if (!guide) return res.status(404).json({ message: 'Guide profile not found' });
    if (bio !== undefined) guide.bio = bio;
    if (location !== undefined) guide.location = location;
    if (state !== undefined) guide.state = state;
    if (city !== undefined) guide.city = city;
    if (languages !== undefined) guide.languages = languages;
    if (specialties !== undefined) guide.specialties = specialties;
    if (hourlyRate !== undefined) guide.hourlyRate = Number(hourlyRate);
    if (availability !== undefined) guide.availability = availability;
    if (avatar !== undefined) guide.avatar = avatar;
    if (phone !== undefined) guide.phone = phone;
    await guide.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// POST /api/guides/:id/review
router.post('/:id/review', protect, restrictTo('tourist'), async (req, res) => {
  try {
    const { rating, comment, bookingId } = req.body;
    if (!rating || !bookingId) {
      return res.status(400).json({ message: 'Booking ID and rating are required' });
    }
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Guide not found' });
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.guide.toString() !== guide._id.toString() || booking.tourist.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Invalid booking or not authorized' });
    }
    if (booking.paymentStatus !== 'fully_paid') {
      return res.status(400).json({ message: 'You can only review after full payment' });
    }
    if (booking.guideReviewed) {
      return res.status(409).json({ message: 'You have already reviewed this booking' });
    }
    const user = await User.findById(req.user.id).select('name');
    guide.reviews.push({ tourist: req.user.id, touristName: user.name, rating, comment });
    guide.recalcRating();
    await guide.save();
    booking.guideReviewed = true;
    await booking.save();
    res.status(201).json({ message: 'Review added', rating: guide.rating, totalReviews: guide.totalReviews });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ message: 'Failed to add review' });
  }
});

// POST /api/guides/review-tourist/:touristId
router.post('/review-tourist/:touristId', protect, restrictTo('guide'), async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'bookingId and rating (1-5) are required' });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.guide.toString() !== (await Guide.findOne({ user: req.user.id }))._id.toString() || booking.tourist.toString() !== req.params.touristId) {
      return res.status(403).json({ message: 'Invalid booking or not authorized' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review after booking is completed' });
    }
    const tourist = await User.findById(req.params.touristId);
    if (!tourist) return res.status(404).json({ message: 'Tourist not found' });
    const already = tourist.reviews.some(r => r.guide.toString() === booking.guide.toString());
    if (already) return res.status(409).json({ message: 'You have already reviewed this tourist' });
    tourist.reviews.push({ guide: booking.guide, rating, comment });
    await tourist.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    console.error('Review tourist error:', err);
    res.status(500).json({ message: 'Failed to add review' });
  }
});

export default router;
