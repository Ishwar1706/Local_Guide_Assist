import { MOCK_BOOKINGS, MOCK_GUIDES } from '../../services/mockData';
import StatCard from '../../components/StatCard';
import { Users, ShieldCheck, DollarSign, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Admin Control Panel</h1>
        <p className="text-slate-500 text-lg">System overview and management.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value="1,492" icon={Users} trend="12% vs last month" trendUp={true} />
        <StatCard title="Total Guides" value={MOCK_GUIDES.length} icon={ShieldCheck} trend="2 new this week" trendUp={true} />
        <StatCard title="Total Bookings" value="348" icon={Calendar} trend="8% vs last month" trendUp={true} />
        <StatCard title="Platform Revenue" value="$42,890" icon={DollarSign} trend="15% vs last month" trendUp={true} />
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
              {MOCK_BOOKINGS.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-4 font-medium text-slate-900">#{booking.id}</td>
                  <td className="py-4 text-slate-600">{booking.tourist.name}</td>
                  <td className="py-4 text-slate-600">{booking.guide.name}</td>
                  <td className="py-4 text-slate-600">{booking.date}</td>
                  <td className="py-4 pr-4 font-medium text-slate-900 text-right">${booking.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}