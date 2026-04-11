import { useState, useEffect } from 'react';
import { guidesAPI } from '../../services/api';
import { Calendar, ChevronLeft, ChevronRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function GuideAvailability() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await guidesAPI.getMyProfile();
        setAvailability(res.data.availability || []);
      } catch {
        setError('Failed to load availability.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggleDate = (dateStr) => {
    setAvailability((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await guidesAPI.updateMyProfile({ availability });
      setSuccessMsg('Availability saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to save availability.');
    } finally {
      setSaving(false);
    }
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" /> Loading availability...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Manage Availability</h1>
        <p className="text-slate-500">Select days when you are available to guide tourists.</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4 font-medium">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 font-medium">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 card-shadow border border-slate-100">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first day alignment */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(year, month, day);
              const isAvailable = availability.includes(dateStr);
              const isPast = dateStr < todayStr;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => !isPast && toggleDate(dateStr)}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                    isPast
                      ? 'text-slate-300 cursor-not-allowed'
                      : isAvailable
                      ? 'bg-[var(--color-primary-600)] text-white shadow-md shadow-blue-200'
                      : isToday
                      ? 'ring-2 ring-[var(--color-primary-600)] text-[var(--color-primary-600)]'
                      : 'hover:bg-blue-50 hover:text-[var(--color-primary-600)] text-slate-700'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-5 h-5 rounded-lg bg-[var(--color-primary-600)]" />
              Available
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-5 h-5 rounded-lg border-2 border-[var(--color-primary-600)]" />
              Today
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-5 h-5 rounded-lg bg-slate-100" />
              Not Available
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100">
            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-[var(--color-primary-600)]" />
              Selected Dates
            </h3>
            {availability.length === 0 ? (
              <p className="text-slate-400 text-sm">No dates selected yet. Click on the calendar to mark your available days.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {[...availability].sort().map((d) => (
                  <div key={d} className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2">
                    <span className="text-sm font-medium text-blue-700">{d}</span>
                    <button onClick={() => toggleDate(d)} className="text-blue-300 hover:text-red-400 transition-colors">
                      <span className="text-xs">✕</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
              <strong className="text-slate-700">{availability.length}</strong> day{availability.length !== 1 ? 's' : ''} selected
            </div>
          </div>

          <button
            id="save-availability-btn"
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--color-primary-600)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-500)] transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] disabled:opacity-60"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={18} /> Save Availability</>}
          </button>
        </div>
      </div>
    </div>
  );
}