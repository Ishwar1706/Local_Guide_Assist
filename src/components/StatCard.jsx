export default function StatCard({ title, value, icon: Icon, trend, trendUp }) {
  return (
    <div className="bg-white p-6 rounded-3xl card-shadow border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-slate-500 font-medium mb-1">{title}</p>
        <h4 className="text-3xl font-extrabold text-slate-900">{value}</h4>
        {trend && (
          <p className={`text-sm mt-2 font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
      <div className="w-14 h-14 bg-blue-50 text-[var(--color-primary-600)] rounded-2xl flex items-center justify-center">
        <Icon size={28} />
      </div>
    </div>
  );
}
