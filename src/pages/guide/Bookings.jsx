import { useState, useEffect } from 'react';
import { bookingsAPI, guidesAPI } from '../../services/api';
import { Calendar, MapPin, Clock, Loader2, CheckCircle2, XCircle, AlertCircle, User, RefreshCw, Star } from 'lucide-react';

const STATUS_STYLES = {
  requested:       { bg: 'bg-purple-50', text: 'text-purple-700',  label: 'New Request' },
  pending_advance: { bg: 'bg-amber-50',  text: 'text-amber-700',   label: 'Awaiting Advance' },
  confirmed:       { bg: 'bg-blue-50',   text: 'text-blue-700',    label: 'Confirmed' },
  completed:       { bg: 'bg-green-50',  text: 'text-green-700',   label: 'Completed' },
  cancelled:       { bg: 'bg-red-50',    text: 'text-red-700',     label: 'Cancelled' },
  // Legacy fallback for old DB records
  pending:         { bg: 'bg-amber-50',  text: 'text-amber-700',   label: 'Pending' },
};

const TABS = ['requested', 'pending_advance', 'confirmed', 'completed', 'cancelled'];

export default function GuideBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requested');
  const [updating, setUpdating] = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, booking: null });
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingsAPI.getGuideBookings();
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleUpdate = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${status} booking.`);
    } finally {
      setUpdating(null);
    }
  };

  const handleReview = async () => {
    try {
      await guidesAPI.reviewTourist(reviewModal.booking.tourist._id, {
        bookingId: reviewModal.booking._id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      alert('Review submitted successfully!');
      setReviewModal({ open: false, booking: null });
      setReviewData({ rating: 5, comment: '' });
    } catch {
      alert('Failed to submit review.');
    }
  };

  const filtered = bookings.filter((b) => b.status === activeTab);
  // Count includes 'pending' with 'requested' for legacy data
  const counts = TABS.reduce((acc, t) => {
    acc[t] = bookings.filter((b) => b.status === t || (t === 'requested' && b.status === 'pending')).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" /> Loading booking requests...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Booking Requests</h1>
          <p className="text-slate-500">Manage tour requests from tourists.</p>
        </div>
        <button onClick={loadBookings} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4">{error}</div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            {counts[tab] > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                tab === 'requested' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl card-shadow border border-slate-100">
          <Calendar size={56} className="mx-auto mb-4 text-slate-200" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No {activeTab} bookings</h3>
          <p className="text-slate-400">
            {activeTab === 'requested' ? 'New requests will appear here.' : `No ${activeTab} bookings at this time.`}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((booking) => {
            const tourist = booking.tourist;
            const touristName = tourist?.name || 'Tourist';
            const touristAvatar = tourist?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(touristName)}&background=e2e8f0`;
            const st = STATUS_STYLES[booking.status] || { bg: 'bg-slate-100', text: 'text-slate-500', label: booking.status || '?' };

            return (
              <div key={booking._id} className="bg-white rounded-3xl p-6 card-shadow border border-slate-100">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Tourist Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <img src={touristAvatar} alt={touristName} className="w-14 h-14 rounded-2xl object-cover" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">{touristName}</h3>
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-sm"><MapPin size={13} />{booking.location}</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={14} className="text-[var(--color-primary-600)]" />
                      {booking.date} at {booking.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={14} className="text-[var(--color-primary-600)]" />
                      {booking.duration}h
                    </div>
                    <div className="text-lg font-extrabold text-slate-900">₹{booking.totalPrice}</div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mt-4 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600 italic">
                    "{booking.notes}"
                  </div>
                )}

                {/* Actions */}
                {booking.status === 'requested' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3 justify-end">
                    <button
                      id={`reject-booking-${booking._id}`}
                      onClick={() => handleUpdate(booking._id, 'cancelled')}
                      disabled={updating === booking._id}
                      className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} /> Decline
                    </button>
                    <button
                      id={`confirm-booking-${booking._id}`}
                      onClick={() => handleUpdate(booking._id, 'pending_advance')}
                      disabled={updating === booking._id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary-600)] text-white rounded-xl hover:bg-[var(--color-primary-500)] font-semibold text-sm transition-colors disabled:opacity-50 shadow-md"
                    >
                      {updating === booking._id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                      Accept Request
                    </button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      id={`complete-booking-${booking._id}`}
                      onClick={() => handleUpdate(booking._id, 'completed')}
                      disabled={updating === booking._id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 font-semibold text-sm transition-colors shadow-md"
                    >
                      <CheckCircle2 size={15} /> Mark Completed
                    </button>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setReviewModal({ open: true, booking })}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary-600)] text-white rounded-xl hover:bg-[var(--color-primary-500)] font-semibold text-sm transition-colors shadow-md"
                    >
                      <Star size={15} /> Review Tourist
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Review Tourist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl ${star <= reviewData.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Comment (optional)</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setReviewModal({ open: false, booking: null })}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                className="flex-1 px-4 py-2.5 bg-[var(--color-primary-600)] text-white rounded-xl hover:bg-[var(--color-primary-500)] font-semibold"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}