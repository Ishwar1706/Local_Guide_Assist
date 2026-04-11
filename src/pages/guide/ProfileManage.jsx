import { useState, useEffect } from 'react';
import { guidesAPI } from '../../services/api';
import { User, MapPin, Globe, DollarSign, BookOpen, Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const COMMON_LANGUAGES  = ['English', 'Hindi', 'Spanish', 'French', 'Japanese', 'German', 'Italian', 'Portuguese', 'Chinese', 'Arabic'];
const COMMON_SPECIALTIES = ['History', 'Food & Culinary', 'Art & Culture', 'Nature & Hiking', 'Photography', 'Architecture', 'Nightlife', 'Shopping', 'Street Art', 'Religious Sites'];

export default function GuideProfileManage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Form fields
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [hourlyRate, setHourlyRate] = useState(20);
  const [languages, setLanguages] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [newLang, setNewLang] = useState('');
  const [newSpec, setNewSpec] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await guidesAPI.getMyProfile();
        const p = res.data;
        setProfile(p);
        setBio(p.bio || '');
        setLocation(p.location || '');
        setHourlyRate(p.hourlyRate || 20);
        setLanguages(p.languages || []);
        setSpecialties(p.specialties || []);
      } catch {
        setError('Failed to load your profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const addLanguage = (lang) => {
    const l = lang.trim();
    if (l && !languages.includes(l)) setLanguages([...languages, l]);
    setNewLang('');
  };

  const addSpecialty = (spec) => {
    const s = spec.trim();
    if (s && !specialties.includes(s)) setSpecialties([...specialties, s]);
    setNewSpec('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await guidesAPI.updateMyProfile({ bio, location, hourlyRate: Number(hourlyRate), languages, specialties });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" /> Loading your profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Manage Profile</h1>
        <p className="text-slate-500">Update your guide profile to attract more tourists.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
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

        {/* Basic Info */}
        <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100 space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User size={18} className="text-[var(--color-primary-600)]" /> Basic Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                <MapPin size={14} /> Location
              </label>
              <input
                id="profile-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Barcelona, Spain"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                <DollarSign size={14} /> Hourly Rate (₹)
              </label>
              <input
                id="profile-rate"
                type="number"
                min={1}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Bio / About Me</label>
            <textarea
              id="profile-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe yourself, your experience, and what makes your tours unique..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors text-slate-800 resize-none"
            />
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe size={18} className="text-[var(--color-primary-600)]" /> Languages Spoken
          </h2>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <span key={lang} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                {lang}
                <button type="button" onClick={() => setLanguages(languages.filter((l) => l !== lang))} className="text-blue-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_LANGUAGES.filter((l) => !languages.includes(l)).map((lang) => (
              <button key={lang} type="button" onClick={() => addLanguage(lang)}
                className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 text-slate-500 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition-colors">
                <Plus size={12} /> {lang}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage(newLang))}
              placeholder="Add custom language..."
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-slate-50 text-slate-800 text-sm"
            />
            <button type="button" onClick={() => addLanguage(newLang)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 text-sm font-medium transition-colors">
              Add
            </button>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={18} className="text-[var(--color-primary-600)]" /> Tour Specialties
          </h2>
          <div className="flex flex-wrap gap-2">
            {specialties.map((spec) => (
              <span key={spec} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                {spec}
                <button type="button" onClick={() => setSpecialties(specialties.filter((s) => s !== spec))} className="text-purple-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_SPECIALTIES.filter((s) => !specialties.includes(s)).map((spec) => (
              <button key={spec} type="button" onClick={() => addSpecialty(spec)}
                className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 text-slate-500 rounded-lg text-sm hover:border-purple-400 hover:text-purple-600 transition-colors">
                <Plus size={12} /> {spec}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpec}
              onChange={(e) => setNewSpec(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty(newSpec))}
              placeholder="Add custom specialty..."
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] bg-slate-50 text-slate-800 text-sm"
            />
            <button type="button" onClick={() => addSpecialty(newSpec)}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-500 text-sm font-medium transition-colors">
              Add
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            id="save-profile-btn"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-[var(--color-primary-600)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-500)] transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] disabled:opacity-60"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={18} /> Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
}