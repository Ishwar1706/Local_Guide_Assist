import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { guidesAPI } from '../../services/api';
import { Star, MapPin, Globe, Clock, Shield, ChevronLeft, Loader2, MessageSquare, BookOpen, Phone, Mail } from 'lucide-react';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function GuideProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await guidesAPI.getById(id);
        setGuide(res.data);
      } catch {
        setError('Could not load guide profile.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" />
        <span>Loading guide profile...</span>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 font-medium">{error || 'Guide not found'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[var(--color-primary-600)] font-semibold underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors">
        <ChevronLeft size={20} /> Back to Search
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 card-shadow border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative">
            <img
              src={guide.avatar}
              alt={guide.name}
              className="w-28 h-28 rounded-2xl object-cover shadow-lg"
            />
            {guide.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow">
                <Shield size={14} />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">{guide.name}</h1>
                <div className="flex items-center gap-1 text-slate-500 mt-1">
                  <MapPin size={15} /> {guide.location || 'Location not specified'}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl">
                  <Star size={16} className="text-amber-500 fill-amber-400" />
                  <span className="font-bold text-amber-700">{guide.rating || 'New'}</span>
                  <span className="text-amber-600 text-sm">({guide.totalReviews} reviews)</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  ₹{guide.hourlyRate}<span className="text-slate-400 text-base font-normal"> / hour</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-slate-600 leading-relaxed">{guide.bio || 'No bio provided yet.'}</p>

            {/* Contact Details */}
            {(guide.phone || guide.email) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {guide.phone && (
                  <a
                    href={`tel:${guide.phone}`}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors"
                  >
                    <Phone size={14} /> {guide.phone}
                  </a>
                )}
                {guide.email && (
                  <a
                    href={`mailto:${guide.email}`}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <Mail size={14} /> {guide.email}
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-5">
              {(guide.languages || []).map((lang, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  <Globe size={13} /> {lang}
                </span>
              ))}
              {(guide.specialties || []).map((s, i) => (
                <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left — Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-[var(--color-primary-600)]" />
              Reviews ({guide.totalReviews})
            </h2>
            {guide.reviews && guide.reviews.length > 0 ? (
              <div className="space-y-5">
                {guide.reviews.map((r, i) => (
                  <div key={i} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.tourist?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.touristName || 'Tourist')}&background=e2e8f0`}
                          alt={r.touristName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-800">{r.touristName || 'Anonymous'}</span>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                    {r.comment && <p className="text-slate-600 text-sm ml-12">{r.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                <p>No reviews yet. Be the first to book!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right — Booking CTA */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-[var(--color-primary-600)]" />
              Book this Guide
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Clock size={14} /> Hourly Rate</span>
                <span className="font-bold text-slate-800">₹{guide.hourlyRate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Reviews</span>
                <span className="font-bold text-slate-800">{guide.totalReviews}</span>
              </div>
              {guide.isVerified && (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 rounded-xl px-3 py-2">
                  <Shield size={14} /> Verified Guide
                </div>
              )}
            </div>

            <button
              id="book-guide-btn"
              onClick={() => navigate(`/tourist/book/${guide.id}`)}
              className="w-full py-3.5 bg-[var(--color-primary-600)] text-white font-bold rounded-xl hover:bg-[var(--color-primary-500)] transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]"
            >
              Book Now
            </button>

            <button
              onClick={() => navigate('/tourist/chat')}
              className="w-full py-3 border border-[var(--color-primary-500)] text-[var(--color-primary-600)] font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} /> Message Guide
            </button>

            <p className="text-center text-xs text-slate-400 mt-1">No charges until booking is confirmed</p>

            {/* Contact info in sidebar too */}
            {(guide.phone || guide.email) && (
              <div className="mt-4 border-t border-slate-100 pt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Direct Contact</p>
                {guide.phone && (
                  <a href={`tel:${guide.phone}`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-green-600 font-medium">
                    <Phone size={14} className="text-green-500" /> {guide.phone}
                  </a>
                )}
                {guide.email && (
                  <a href={`mailto:${guide.email}`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 font-medium truncate">
                    <Mail size={14} className="text-blue-500" /> {guide.email}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}