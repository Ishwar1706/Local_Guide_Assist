import { useState, useEffect, useCallback } from 'react';
import { guidesAPI } from '../../services/api';
import GuideCard from '../../components/GuideCard';
import { Search, MapPin, Languages, Filter, Loader2, X, ChevronDown } from 'lucide-react';

// ──────────────────────────────────────────────────────────────
//  INDIA DATA
// ──────────────────────────────────────────────────────────────
const INDIA_STATES_CITIES = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Tirupati', 'Guntur', 'Kurnool'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat'],
  'Assam': ['Guwahati', 'Jorhat', 'Dibrugarh', 'Silchar', 'Tezpur'],
  'Bihar': ['Patna', 'Gaya', 'Bodh Gaya', 'Muzaffarpur', 'Bhagalpur'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Jagdalpur', 'Bilaspur'],
  'Delhi': ['New Delhi', 'Old Delhi', 'Dwarka', 'Noida', 'Gurugram'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Calangute'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Rann of Kutch', 'Dwarka', 'Somnath'],
  'Haryana': ['Chandigarh', 'Gurugram', 'Faridabad', 'Ambala', 'Kurukshetra'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Kasauli', 'Kullu', 'Spiti'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Hazaribagh'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hampi', 'Coorg', 'Chikmagalur', 'Badami'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Munnar', 'Alleppey', 'Thrissur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Khajuraho', 'Orchha', 'Ujjain', 'Pachmarhi'],
  'Maharashtra': ['Mumbai', 'Pune', 'Aurangabad', 'Nashik', 'Nagpur', 'Lonavala', 'Mahabaleshwar'],
  'Manipur': ['Imphal', 'Moirang', 'Bishnupur'],
  'Meghalaya': ['Shillong', 'Cherrapunji', 'Mawlynnong'],
  'Mizoram': ['Aizawl', 'Champhai'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
  'Odisha': ['Bhubaneswar', 'Puri', 'Konark', 'Cuttack', 'Chilika'],
  'Punjab': ['Amritsar', 'Chandigarh', 'Ludhiana', 'Jalandhar', 'Patiala'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Jaisalmer', 'Pushkar', 'Ajmer', 'Ranthambore'],
  'Sikkim': ['Gangtok', 'Lachung', 'Pelling', 'Namchi'],
  'Tamil Nadu': ['Chennai', 'Madurai', 'Coimbatore', 'Tiruchirappalli', 'Kanchipuram', 'Mahabalipuram', 'Ooty'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Tripura': ['Agartala', 'Udaipur'],
  'Uttar Pradesh': ['Agra', 'Varanasi', 'Lucknow', 'Mathura', 'Vrindavan', 'Allahabad', 'Ayodhya', 'Banaras'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Mussoorie', 'Nainital', 'Char Dham', 'Auli'],
  'West Bengal': ['Kolkata', 'Darjeeling', 'Siliguri', 'Sundarbans', 'Shantiniketan'],
};

const ALL_STATES = Object.keys(INDIA_STATES_CITIES).sort();

const INDIAN_LANGUAGES = [
  'All Languages',
  'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
  'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese',
  'Maithili', 'Sanskrit', 'Konkani', 'Sindhi', 'Kashmiri', 'Nepali',
  'English',
];

const QUICK_FILTERS = ['All', 'Top Rated', 'Budget Friendly', 'Verified Only'];

// ──────────────────────────────────────────────────────────────
//  COMPONENT
// ──────────────────────────────────────────────────────────────
export default function SearchGuides() {
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity]   = useState('');
  const [selectedLang, setSelectedLang]   = useState('All Languages');
  const [activeTag, setActiveTag]         = useState('All');
  const [guides, setGuides]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [selectedDate, setSelectedDate]   = useState('');
  const [selectedTime, setSelectedTime]   = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');

  const availableCities = selectedState ? INDIA_STATES_CITIES[selectedState] || [] : [];

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedState('');
    setSelectedCity('');
    setSelectedLang('All Languages');
    setActiveTag('All');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedDuration('');
  };

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm)  params.search   = searchTerm;
      if (selectedState) params.state  = selectedState;
      if (selectedCity)  params.city   = selectedCity;
      if (selectedLang && selectedLang !== 'All Languages') params.language = selectedLang;
      if (activeTag === 'Budget Friendly') params.maxRate = 700;
      if (selectedDate) params.date = selectedDate;
      if (selectedTime) params.time = selectedTime;
      if (selectedDuration) params.duration = selectedDuration;

      const res = await guidesAPI.getAll(params);
      let data = res.data;

      if (activeTag === 'Top Rated')    data = [...data].sort((a, b) => b.rating - a.rating);
      if (activeTag === 'Verified Only') data = data.filter((g) => g.isVerified);

      setGuides(data);
    } catch {
      setError('Failed to load guides. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedState, selectedCity, selectedLang, activeTag, selectedDate, selectedTime, selectedDuration]);

  useEffect(() => {
    const t = setTimeout(fetchGuides, 400);
    return () => clearTimeout(t);
  }, [fetchGuides]);

  const hasActiveFilters = selectedState || selectedCity || (selectedLang && selectedLang !== 'All Languages') || searchTerm || selectedDate || selectedTime || selectedDuration;

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ─────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Find Your Local Guide</h1>
        <p className="text-slate-500 text-lg">Explore guides across every state and city of India.</p>
      </div>

      {/* ── Main Search Row ────────────────────────── */}
      <div className="bg-white p-4 rounded-3xl card-shadow border border-slate-100 flex flex-col gap-4">
        {/* Search bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input
            id="guide-search"
            type="text"
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none transition-all text-slate-700"
            placeholder="Search by guide name, specialty, or interest..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setActiveTag('All'); }}
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* State Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapPin size={17} />
            </div>
            <select
              id="guide-state-filter"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('');
                setActiveTag('All');
              }}
              className="w-full appearance-none pl-9 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none text-slate-700 text-sm"
            >
              <option value="">All States</option>
              {ALL_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* City Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapPin size={17} />
            </div>
            <select
              id="guide-city-filter"
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setActiveTag('All'); }}
              disabled={!selectedState}
              className="w-full appearance-none pl-9 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none text-slate-700 text-sm disabled:opacity-50"
            >
              <option value="">{selectedState ? 'All Cities' : 'Select State First'}</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Language Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Languages size={17} />
            </div>
            <select
              id="guide-language-filter"
              value={selectedLang}
              onChange={(e) => { setSelectedLang(e.target.value); setActiveTag('All'); }}
              className="w-full appearance-none pl-9 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none text-slate-700 text-sm"
            >
              {INDIAN_LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Date Input */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setActiveTag('All'); }}
              className="w-full pl-3 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none text-slate-700 text-sm"
            />
          </div>
        </div>

        {/* Second Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Time Input */}
          <div className="relative">
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => { setSelectedTime(e.target.value); setActiveTag('All'); }}
              className="w-full pl-3 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none text-slate-700 text-sm"
            />
          </div>

          {/* Duration Input */}
          <div className="relative">
            <select
              value={selectedDuration}
              onChange={(e) => { setSelectedDuration(e.target.value); setActiveTag('All'); }}
              className="w-full appearance-none pl-3 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none text-slate-700 text-sm"
            >
              <option value="">Any Duration</option>
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="5">5 hours</option>
              <option value="6">6 hours</option>
              <option value="7">7 hours</option>
              <option value="8">8 hours</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between gap-3">
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
            >
              <X size={15} /> Clear all filters
            </button>
          ) : <div />}
          <button
            id="guide-search-btn"
            onClick={fetchGuides}
            className="px-8 py-3 bg-[var(--color-primary-600)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-500)] transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2 text-sm"
          >
            <Filter size={16} /> Search Guides
          </button>
        </div>
      </div>

      {/* ── Quick Filters ──────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Sort / Filter:</span>
        {QUICK_FILTERS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTag === tag
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ── Active Filter Pills ────────────────────── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedState && (
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium px-3 py-1.5 rounded-full">
              <MapPin size={11} /> {selectedState}
              <button onClick={() => { setSelectedState(''); setSelectedCity(''); }} className="ml-1 hover:text-blue-900"><X size={11} /></button>
            </span>
          )}
          {selectedCity && (
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium px-3 py-1.5 rounded-full">
              <MapPin size={11} /> {selectedCity}
              <button onClick={() => setSelectedCity('')} className="ml-1 hover:text-blue-900"><X size={11} /></button>
            </span>
          )}
          {selectedLang && selectedLang !== 'All Languages' && (
            <span className="flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium px-3 py-1.5 rounded-full">
              <Languages size={11} /> {selectedLang}
              <button onClick={() => setSelectedLang('All Languages')} className="ml-1 hover:text-purple-900"><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* ── Results ────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 size={32} className="animate-spin mr-3" />
          <span className="text-lg">Loading guides...</span>
        </div>
      ) : error ? (
        <div className="py-12 text-center bg-red-50 rounded-3xl border border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={fetchGuides} className="mt-4 text-[var(--color-primary-600)] font-semibold underline">
            Retry
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 font-medium -mt-4">
            {guides.length} guide{guides.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
            {guides.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100">
                <p className="text-lg text-slate-500">No guides found for your search.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-[var(--color-primary-600)] font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}