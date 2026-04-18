import { useState, useEffect } from 'react';
import { adminAPI, bookingsAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import { Users, ShieldCheck, DollarSign, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          adminAPI.getStats(),
          bookingsAPI.getAllBookings()
        ]);
        setStats(statsRes.data);
        setBookings(bookingsRes.data.slice(0, 5)); // Last 5 bookings
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Admin Control Panel</h1>
        <p className="text-slate-500 text-lg">System overview and management.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} trend="Updated" trendUp={true} />
        <StatCard title="Total Guides" value={stats?.totalGuides || 0} icon={ShieldCheck} trend={`${stats?.pendingVerification || 0} pending`} trendUp={false} />
        <StatCard title="Total Bookings" value={stats?.totalBookings || 0} icon={Calendar} trend="Active" trendUp={true} />
        <StatCard title="Platform Revenue" value={`₹${stats?.totalRevenue || 0}`} icon={DollarSign} trend="Total earned" trendUp={true} />
      </div>

      <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
          <button className="text-[var(--color-primary-600)] font-semibold hover:text-[var(--color-primary-500)] text-sm">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-sm">
                <th className="pb-3 font-semibold pl-4">Booking ID</th>
                <th className="pb-3 font-semibold">Tourist</th>
                <th className="pb-3 font-semibold">Guide</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right pr-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-4 font-medium text-slate-900">#{booking._id.slice(-6)}</td>
                  <td className="py-4 text-slate-600">{booking.tourist?.name || 'Unknown'}</td>
                  <td className="py-4 text-slate-600">{booking.guide?.user?.name || 'Unknown'}</td>
                  <td className="py-4 text-slate-600">{booking.date}</td>
                  <td className="py-4 pr-4 font-medium text-slate-900 text-right">₹{booking.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}