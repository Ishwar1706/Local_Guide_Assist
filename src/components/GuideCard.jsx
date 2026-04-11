import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Globe, ArrowRight, BadgeCheck, MessageSquare, Phone, Mail } from 'lucide-react';

export default function GuideCard({ guide }) {
  const navigate = useNavigate();
  // Prefer city/state combo, fall back to location string
  const locationLabel =
    guide.city && guide.state
      ? `${guide.city}, ${guide.state}`
      : guide.location || 'India';

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative shrink-0">
          <img
            src={guide.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name)}&background=random&size=128`}
            alt={guide.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow"
          />
          {guide.isVerified && (
            <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow" title="Verified Guide">
              <BadgeCheck size={14} />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">{guide.name}</h3>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-sm font-semibold shrink-0">
              <Star size={13} className="fill-amber-500 text-amber-500" /> {guide.rating}
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
            <MapPin size={12} />
            <span className="truncate">{locationLabel}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{guide.totalReviews} review{guide.totalReviews !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-slate-600 text-sm mb-4 flex-1 line-clamp-3">{guide.bio}</p>

      {/* Specialties */}
      {guide.specialties?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {guide.specialties.slice(0, 3).map((s, i) => (
            <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
              {s}
            </span>
          ))}
          {guide.specialties.length > 3 && (
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-lg">
              +{guide.specialties.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Languages */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {guide.languages.slice(0, 3).map((lang, i) => (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg border border-slate-100">
            <Globe size={11} /> {lang}
          </span>
        ))}
        {guide.languages.length > 3 && (
          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-xs rounded-lg border border-slate-100">
            +{guide.languages.length - 3} more
          </span>
        )}
      </div>

      {/* Contact Details */}
      {(guide.phone || guide.email) && (
        <div className="flex flex-col gap-1.5 mb-4 border border-slate-100 rounded-xl p-3 bg-slate-50/60">
          {guide.phone && (
            <a href={`tel:${guide.phone}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-[var(--color-primary-600)] transition-colors">
              <Phone size={12} className="text-green-500 shrink-0" />
              <span className="font-mono font-medium">{guide.phone}</span>
            </a>
          )}
          {guide.email && (
            <a href={`mailto:${guide.email}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-[var(--color-primary-600)] transition-colors truncate">
              <Mail size={12} className="text-blue-500 shrink-0" />
              <span className="truncate">{guide.email}</span>
            </a>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-slate-900">₹{guide.hourlyRate ?? guide.price}</span>
            <span className="text-slate-500 text-sm"> / hr</span>
          </div>
          <Link
            to={`/tourist/guide/${guide.id || guide._id}`}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-sm"
          >
            View <ArrowRight size={14} />
          </Link>
        </div>
        {/* Message Button */}
        <button
          onClick={() => navigate('/tourist/chat', {
            state: {
              guideUserId: guide.userId || guide.id || guide._id,
              guideName: guide.name,
              guideAvatar: guide.avatar,
              guidePhone: guide.phone,
              guideEmail: guide.email,
            }
          })}
          className="w-full flex items-center justify-center gap-2 py-2 border border-[var(--color-primary-500)] text-[var(--color-primary-600)] rounded-xl hover:bg-blue-50 font-semibold text-sm transition-colors"
        >
          <MessageSquare size={15} /> Message Guide
        </button>
      </div>
    </div>
  );
}
