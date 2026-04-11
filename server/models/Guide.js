import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    tourist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    touristName: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const guideSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    languages: { type: [String], default: ['Hindi'] },
    specialties: { type: [String], default: [] },
    hourlyRate: { type: Number, default: 20, min: 0 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    isVerified: { type: Boolean, default: false },
    availability: { type: [String], default: [] },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { timestamps: true }
);

guideSchema.methods.recalcRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.totalReviews = this.reviews.length;
  }
};

export default mongoose.model('Guide', guideSchema);
