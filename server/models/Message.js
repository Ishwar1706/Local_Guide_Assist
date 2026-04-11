import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false, // optional — for direct/pre-booking messages
    default: null,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isAutoMsg: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
