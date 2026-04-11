import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { guidesAPI, bookingsAPI } from '../../services/api';
import GuideCard from '../../components/GuideCard';
import { Compass, Calendar as CalendarIcon, Star, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  requested:       'bg-purple-50 text-purple-700',
  pending_advance: 'bg-amber-50 text-amber-700',
  pending:         'bg-amber-50 text-amber-700',
  confirmed:       'bg-blue-50 text-blue-700',
  completed:       'bg-green-50 text-green-700',
  cancelled:       'bg-red-50 text-red-600',
};

export default function TouristDashboard() {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    guidesAPI.getAll().then((res) => setGuides(res.data)).catch(() => {}).finally(() => setLoadingGuides(false));
    bookingsAPI.getMyBookings().then((res) => setBookings(res.data)).catch(() => {}).finally(() => setLoadingBookings(false));
  }, []);

  const upcomingBooking = bookings.find((b) => ['confirmed', 'pending_advance', 'requested', 'pending'].includes(b.status)) || null;
  const guideName = upcomingBooking?.guide?.user?.name || upcomingBooking?.guide?.name || '';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back, {user?.name || 'Tourist'}! 👋</h1>
        <p className="text-slate-500 text-lg">Ready for your next adventure?</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Next Trip Banner */}
          <div className="bg-[var(--color-primary-600)] rounded-3xl p-8 text-white relative overflow-hidden shadow-[0_8px_32px_rgba(37,99,235,0.2)]">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-6 backdrop-blur-md">
                <CalendarIcon size={14} />
                {upcomingBooking ? 'Next Upcoming Trip' : 'No upcoming trips'}
              </span>
              {upcomingBooking ? (
                <>
                  <h3 className="text-3xl font-bold mb-2">{upcomingBooking.location}</h3>
                  <p className="text-blue-100 text-lg mb-8">with {guideName} • {upcomingBooking.date}</p>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-bold mb-2">Explore India</h3>
                  <p className="text-blue-100 text-lg mb-8">Find a local guide and start your adventure</p>
                </>
              )}
              <Link
                to={upcomingBooking ? '/tourist/bookings' : '/tourist/search'}
                className="inline-block bg-white text-[var(--color-primary-600)] px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg"
              >
                {upcomingBooking ? 'View Booking Details' : 'Find a Guide'} <ArrowRight className="inline" size={16} />
              </Link>
            </div>
            <Compass size={120} className="absolute -bottom-6 -right-6 text-white/10" />
          </div>

          {/* Featured Guides */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Featured Guides</h3>
              <Link to="/tourist/search" className="text-[var(--color-primary-600)] font-semibold hover:text-[var(--color-primary-500)] flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            {loadingGuides ? (
              <div className="flex items-center gap-2 text-slate-400 py-8 justify-center">
                <Loader2 size={20} className="animate-spin" /> Loading guides...
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {guides.slice(0, 2).map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
                {guides.length === 0 && (
                  <div className="col-span-2 py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
                    <p>No guides registered yet.</p>
                    <p className="text-sm mt-1">Check back soon!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings Sidebar */}
        <div>
          <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Bookings</h3>
            {loadingBookings ? (
              <div className="flex items-center gap-2 text-slate-400 justify-center py-6">
                <Loader2 size={18} className="animate-spin" /> Loading...
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Star size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No bookings yet!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 3).map((b) => {
                  const guideName = b.guide?.user?.name || b.guide?.name || 'Guide';
                  return (
                    <div key={b._id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{guideName}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{b.date} • {b.duration}h</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold capitalize ${STATUS_COLORS[b.status] || 'bg-slate-50 text-slate-500'}`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[var(--color-primary-600)] font-bold text-sm mt-1">₹{b.totalPrice}</p>
                    </div>
                  );
                })}
              </div>
            )}
            <Link to="/tourist/bookings" className="w-full mt-6 py-3 text-slate-600 font-semibold bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors block text-center text-sm">
              See All Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}