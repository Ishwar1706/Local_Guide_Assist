import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    tourist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
    date: { type: String, required: true },   // "YYYY-MM-DD"
    time: { type: String, required: true },   // "HH:MM"
    duration: { type: Number, required: true, min: 1 },
    location: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['requested', 'pending_advance', 'confirmed', 'completed', 'cancelled'],
      default: 'requested',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'advance_paid', 'fully_paid', 'refunded'],
      default: 'unpaid',
    },
    paymentId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
