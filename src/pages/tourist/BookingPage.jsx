import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { guidesAPI, bookingsAPI, paymentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin, Clock, Calendar, ChevronLeft, Star, Shield,
  CreditCard, Lock, CheckCircle2, Loader2, AlertCircle, X
} from 'lucide-react';

// ─── Main Booking Page ────────────────────────────────────
export default function BookingPage() {
  const { id } = useParams(); // guide ID
  const navigate = useNavigate();
  const { user } = useAuth();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(2);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Payment
  const [booking, setBooking] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await guidesAPI.getById(id);
        setGuide(res.data);
        setLocation(res.data.location || '');
      } catch {
        setError('Could not load guide information. Please go back and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const totalPrice = guide ? guide.hourlyRate * duration : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!date) { setError('Please select a date'); return; }
    setSubmitting(true);
    try {
      const res = await bookingsAPI.create({
        guideId: id,
        date,
        time,
        duration,
        location,
        notes,
      });
      navigate('/tourist/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" /> Loading...
      </div>
    );
  }

  if (!guide) {
    return <div className="py-20 text-center text-red-500">{error || 'Guide not found'}</div>;
  }

  // Get today's date as min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 pb-10">

      <button onClick={() => navigate('/tourist/search')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors">
        <ChevronLeft size={20} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 card-shadow border border-slate-100">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Book Your Tour</h1>
            <p className="text-slate-500 mb-8">Fill in the details below to book with {guide.name}</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-[var(--color-primary-600)]" /> Tour Date
                </label>
                <input
                  id="booking-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors text-slate-800"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-[var(--color-primary-600)]" /> Start Time
                </label>
                <select
                  id="booking-time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors text-slate-800"
                >
                  {['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-[var(--color-primary-600)]" /> Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDuration(h)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        duration === h
                          ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)] shadow-md'
                          : 'border-slate-200 text-slate-600 hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-600)]'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-[var(--color-primary-600)]" /> Meeting Location
                </label>
                <input
                  id="booking-location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hotel lobby, main square..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors text-slate-800"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Special Requests / Notes</label>
                <textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any specific interests, mobility requirements, dietary restrictions..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors text-slate-800 resize-none"
                />
              </div>

              <button
                id="confirm-booking-btn"
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[var(--color-primary-600)] text-white font-bold rounded-xl hover:bg-[var(--color-primary-500)] transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Submitting Request...</>
                ) : (
                  <>Send Booking Request</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Guide Summary Sidebar */}
        <div>
          <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100 sticky top-24">
            <img
              src={guide.avatar}
              alt={guide.name}
              className="w-full h-40 object-cover rounded-2xl mb-4"
            />
            <h3 className="text-xl font-bold text-slate-900">{guide.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1 mb-4"><MapPin size={13} />{guide.location}</div>

            <div className="flex items-center gap-2 mb-4">
              <Star size={15} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold text-slate-700">{guide.rating || 'New'}</span>
              <span className="text-slate-400 text-sm">({guide.totalReviews} reviews)</span>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Rate</span>
                <span className="font-semibold text-slate-800">₹{guide.hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-slate-800">{duration} hour{duration > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-100 pt-3 mt-3">
                <span className="font-bold text-slate-800">Total</span>
                <span className="font-extrabold text-[var(--color-primary-600)] text-lg">₹{totalPrice}</span>
              </div>
            </div>

            {guide.isVerified && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 rounded-xl px-3 py-2">
                <Shield size={14} /> Verified Guide
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}