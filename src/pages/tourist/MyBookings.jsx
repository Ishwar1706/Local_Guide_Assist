import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';
import PaymentModal from '../../components/PaymentModal';
import {
  Calendar, MapPin, Clock, Loader2, CheckCircle2, XCircle,
  AlertCircle, RefreshCw, ChevronDown, ChevronUp, MessageSquare,
  IndianRupee, User, FileText, Shield
} from 'lucide-react';

const STATUS_STYLES = {
  requested:       { bg: 'bg-purple-100', text: 'text-purple-700',  icon: <AlertCircle size={14} />,  label: 'Requested — Awaiting Guide' },
  pending_advance: { bg: 'bg-amber-100',  text: 'text-amber-700',   icon: <AlertCircle size={14} />,  label: 'Accepted — Pay Advance' },
  confirmed:       { bg: 'bg-blue-100',   text: 'text-blue-700',    icon: <CheckCircle2 size={14} />, label: 'Confirmed' },
  completed:       { bg: 'bg-green-100',  text: 'text-green-700',   icon: <CheckCircle2 size={14} />, label: 'Completed' },
  cancelled:       { bg: 'bg-red-100',    text: 'text-red-700',     icon: <XCircle size={14} />,      label: 'Cancelled' },
  pending:         { bg: 'bg-amber-100',  text: 'text-amber-700',   icon: <AlertCircle size={14} />,  label: 'Pending' },
};
const PAY_STYLES = {
  fully_paid:   { bg: 'bg-green-100',  text: 'text-green-700', label: '✓ Fully Paid' },
  advance_paid: { bg: 'bg-blue-100',   text: 'text-blue-700',  label: '½ Advance Paid' },
  unpaid:       { bg: 'bg-amber-100',  text: 'text-amber-700', label: 'Unpaid' },
  refunded:     { bg: 'bg-slate-100',  text: 'text-slate-500', label: 'Refunded' },
  paid:         { bg: 'bg-green-100',  text: 'text-green-700', label: '✓ Paid' },
};

const STEPS = [
  { key: 'requested',       label: 'Request Sent' },
  { key: 'pending_advance', label: 'Guide Accepted' },
  { key: 'confirmed',       label: 'Advance Paid' },
  { key: 'completed',       label: 'Trip Done' },
  { key: 'fully_paid',      label: 'Payment Complete', isPayment: true },
];

function ProgressBar({ booking }) {
  const statusOrder = ['requested', 'pending_advance', 'confirmed', 'completed'];
  const currentIndex = statusOrder.indexOf(booking.status);
  const isPaid = booking.paymentStatus === 'fully_paid';

  return (
    <div className="flex items-center gap-1 mt-4">
      {STEPS.map((step, i) => {
        const isDone = step.isPayment
          ? isPaid
          : i <= currentIndex && booking.status !== 'cancelled';
        const isCurrent = !step.isPayment && i === currentIndex;

        return (
          <div key={step.key} className="flex flex-1 flex-col items-center gap-1">
            <div className={`w-full h-1.5 rounded-full transition-colors ${
              isDone ? 'bg-[var(--color-primary-600)]' : isCurrent ? 'bg-[var(--color-primary-300)]' : 'bg-slate-200'
            }`} />
            <span className={`text-[9px] font-semibold text-center leading-tight ${
              isDone || isCurrent ? 'text-[var(--color-primary-600)]' : 'text-slate-400'
            }`}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [activePayment, setActivePayment] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadBookings = async () => {
    setLoading(true); setError('');
    try {
      const res = await bookingsAPI.getMyBookings();
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await bookingsAPI.updateStatus(bookingId, 'cancelled');
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch {
      alert('Failed to cancel booking.');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" /> Loading your bookings...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {activePayment && (
        <PaymentModal
          booking={activePayment.booking}
          paymentType={activePayment.type}
          onSuccess={() => { setActivePayment(null); loadBookings(); }}
          onClose={() => setActivePayment(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">My Bookings</h1>
          <p className="text-slate-500">Track status, payments, and communicate with guides.</p>
        </div>
        <button onClick={loadBookings} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 font-medium">{error}</div>}

      {!error && bookings.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl">
          <Calendar size={56} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No bookings yet</h3>
          <p className="text-slate-400">Find a guide and book your first adventure!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const guide = booking.guide;
            const guideName = guide?.user?.name || guide?.name || 'Guide';
            const guideAvatar = guide?.user?.avatar || guide?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideName)}&background=3b82f6&color=fff`;
            const status = STATUS_STYLES[booking.status] || { bg: 'bg-slate-100', text: 'text-slate-600', icon: <AlertCircle size={14} />, label: booking.status || 'Unknown' };
            const pay = PAY_STYLES[booking.paymentStatus] || { bg: 'bg-slate-100', text: 'text-slate-500', label: booking.paymentStatus || '-' };
            const isExpanded = expandedId === booking._id;
            const isCancelled = booking.status === 'cancelled';

            return (
              <div key={booking._id} className={`glass-panel rounded-3xl overflow-hidden transition-all duration-300 ${isCancelled ? 'opacity-70' : ''}`}>
                {/* Card Header — always visible, click to expand */}
                <div
                  className="p-5 cursor-pointer hover:bg-white/40 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Guide Avatar + Name */}
                    <div className="flex items-center gap-3 flex-1">
                      <img src={guideAvatar} alt={guideName} className="w-12 h-12 rounded-xl object-cover shadow" />
                      <div>
                        <h3 className="font-bold text-slate-900">{guideName}</h3>
                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                          <MapPin size={11} /> {booking.location}
                        </div>
                      </div>
                    </div>

                    {/* Date + Price */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar size={13} className="text-[var(--color-primary-600)]" />
                        <span className="font-medium">{booking.date}</span>
                      </div>
                      <div className="font-extrabold text-slate-900">₹{booking.totalPrice}</div>
                    </div>

                    {/* Status + Expand */}
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${status.bg} ${status.text}`}>
                        {status.icon} {status.label}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Progress bar inside card header */}
                  {!isCancelled && <ProgressBar booking={booking} />}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/40 px-5 pb-5">
                    <div className="grid sm:grid-cols-2 gap-6 mt-5">
                      {/* Left: Trip Details */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                          <FileText size={14} /> Trip Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar size={14} className="text-[var(--color-primary-600)]" />
                            <span><strong>Date:</strong> {booking.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock size={14} className="text-[var(--color-primary-600)]" />
                            <span><strong>Time:</strong> {booking.time} • {booking.duration} hour{booking.duration > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin size={14} className="text-[var(--color-primary-600)]" />
                            <span><strong>Venue:</strong> {booking.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <User size={14} className="text-[var(--color-primary-600)]" />
                            <span><strong>Guide:</strong> {guideName}</span>
                          </div>
                          {booking.notes && (
                            <div className="bg-slate-50 rounded-xl px-3 py-2 text-slate-600 italic text-xs mt-2">
                              "{booking.notes}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Payment Summary */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                          <IndianRupee size={14} /> Payment Summary
                        </h4>
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Rate</span>
                            <span className="font-semibold">₹{guide?.hourlyRate ?? '—'}/hr × {booking.duration}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Total</span>
                            <span className="font-bold text-slate-900">₹{booking.totalPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Advance (50%)</span>
                            <span className="font-semibold">₹{booking.totalPrice / 2}</span>
                          </div>
                          <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                            <span className="font-bold text-slate-700">Payment Status</span>
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${pay.bg} ${pay.text}`}>
                              {pay.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 flex flex-wrap gap-3 justify-end items-center">
                      {/* Message Button — always visible if not cancelled */}
                      {!isCancelled && (
                        <button
                          onClick={() => navigate('/tourist/chat', { state: { bookingId: booking._id } })}
                          className="flex items-center gap-2 px-4 py-2.5 border border-[var(--color-primary-500)] text-[var(--color-primary-600)] rounded-xl hover:bg-blue-50 font-semibold text-sm transition-colors"
                        >
                          <MessageSquare size={15} /> Message Guide
                        </button>
                      )}

                      {/* Cancel */}
                      {['requested', 'pending_advance', 'pending'].includes(booking.status) && (
                        <button
                          id={`cancel-booking-${booking._id}`}
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelling === booking._id}
                          className="flex items-center gap-2 px-4 py-2.5 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 font-medium text-sm transition-colors disabled:opacity-50"
                        >
                          {cancelling === booking._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                          Cancel Booking
                        </button>
                      )}

                      {/* Pay Advance */}
                      {booking.status === 'pending_advance' && (
                        <button
                          onClick={() => setActivePayment({ booking, type: 'advance' })}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary-600)] text-white rounded-xl hover:bg-[var(--color-primary-500)] font-bold text-sm transition-colors shadow-md"
                        >
                          <Shield size={14} /> Pay 50% Advance — ₹{booking.totalPrice / 2}
                        </button>
                      )}

                      {/* Pay Final */}
                      {booking.status === 'completed' && booking.paymentStatus === 'advance_paid' && (
                        <button
                          onClick={() => setActivePayment({ booking, type: 'final' })}
                          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 font-bold text-sm transition-colors shadow-md"
                        >
                          <CheckCircle2 size={14} /> Pay Final 50% — ₹{booking.totalPrice / 2}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}