import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import { DollarSign, Users, Star, TrendingUp, Loader2, CheckCircle2, Clock, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
};

export default function GuideDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getGuideBookings()
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = bookings.filter((b) => b.status === 'pending');
  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const completed = bookings.filter((b) => b.status === 'completed');
  const totalEarnings = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((acc, b) => acc + b.totalPrice, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Guide Overview</h1>
        <p className="text-slate-500 text-lg">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Earnings" value={`₹${totalEarnings}`} icon={DollarSign} trend="From paid bookings" trendUp={true} />
        <StatCard title="Completed Tours" value={String(completed.length)} icon={Users} trend="All time" trendUp={true} />
        <StatCard title="Upcoming Tours" value={String(confirmed.length)} icon={Clock} trend="Confirmed bookings" trendUp={confirmed.length > 0} />
        <StatCard title="Pending Requests" value={String(pending.length)} icon={ClipboardList} trend="Awaiting response" trendUp={false} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 justify-center py-12">
          <Loader2 size={24} className="animate-spin" /> Loading bookings...
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                New Requests{' '}
                {pending.length > 0 && (
                  <span className="ml-2 bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-sm">{pending.length}</span>
                )}
              </h3>
              <Link to="/guide/bookings" className="text-[var(--color-primary-600)] font-semibold hover:text-[var(--color-primary-500)] text-sm">View All</Link>
            </div>
            {pending.length > 0 ? (
              <div className="space-y-4">
                {pending.slice(0, 3).map((b) => (
                  <div key={b._id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0">
                    <div>
                      <p className="font-semibold text-slate-800">{b.tourist?.name || 'Tourist'}</p>
                      <p className="text-slate-500 text-sm">{b.date} • {b.duration}h • {b.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--color-primary-600)]">₹{b.totalPrice}</p>
                      <span className="text-xs font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg">Pending</span>
                    </div>
                  </div>
                ))}
                <Link to="/guide/bookings" className="w-full block text-center py-2.5 bg-[var(--color-primary-600)] text-white font-semibold rounded-xl text-sm hover:bg-[var(--color-primary-500)] transition-colors mt-2">
                  Manage Requests
                </Link>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-25" />
                <p>No pending requests right now.</p>
              </div>
            )}
          </div>

          {/* Upcoming Tours */}
          <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Upcoming Tours</h3>
              <Link to="/guide/availability" className="text-[var(--color-primary-600)] font-semibold hover:text-[var(--color-primary-500)] text-sm">Set Availability</Link>
            </div>
            {confirmed.length > 0 ? (
              <div className="space-y-4">
                {confirmed.slice(0, 3).map((b) => (
                  <div key={b._id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0">
                    <div>
                      <p className="font-semibold text-slate-800">{b.tourist?.name || 'Tourist'}</p>
                      <p className="text-slate-500 text-sm">{b.date} at {b.time} • {b.duration}h</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{b.totalPrice}</p>
                      <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 size={40} className="mx-auto mb-3 opacity-25" />
                <p>No upcoming tours. Set your availability!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}