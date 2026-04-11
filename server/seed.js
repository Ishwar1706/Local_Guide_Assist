/**
 * seed.js  — run once with:  node server/seed.js
 * Inserts synthetic Indian guide data into MongoDB Atlas.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Guide from './models/Guide.js';

const MONGO_URI = process.env.MONGO_URI;

// ──────────────────────────────────────────────────────────────
//  ALL 22 OFFICIAL INDIAN LANGUAGES (Scheduled Languages)
// ──────────────────────────────────────────────────────────────
const INDIAN_LANGUAGES = [
  'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
  'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese',
  'Maithili', 'Sanskrit', 'Dogri', 'Konkani', 'Sindhi', 'Manipuri',
  'Bodo', 'Santhali', 'Kashmiri', 'Nepali', 'English'
];

// ──────────────────────────────────────────────────────────────
//  SYNTHETIC GUIDE DATA — 20 guides across 10 Indian states
// ──────────────────────────────────────────────────────────────
const GUIDES_DATA = [
  // ── Rajasthan ──────────────────────────────────────────
  {
    name: 'Arjun Sharma',
    email: 'arjun.sharma@indiguide.in',
    state: 'Rajasthan', city: 'Jaipur',
    location: 'Jaipur, Rajasthan',
    bio: 'Born and raised in the Pink City, I bring history alive! From the majestic Amber Fort to hidden havelis and spice bazaars — I know every corner of Jaipur.',
    languages: ['Hindi', 'English', 'Rajasthani'],
    specialties: ['Heritage Walks', 'Amber Fort', 'Block Printing', 'Camel Safari', 'Street Food'],
    hourlyRate: 800,
    rating: 4.9, totalReviews: 134,
    isVerified: true,
  },
  {
    name: 'Priya Rathore',
    email: 'priya.rathore@indiguide.in',
    state: 'Rajasthan', city: 'Jodhpur',
    location: 'Jodhpur, Rajasthan',
    bio: 'Expert guide for the Blue City — Mehrangarh Fort, Umaid Bhawan, and the labyrinthine old city. I run sunset desert picnic tours that tourists adore.',
    languages: ['Hindi', 'English', 'Marwari'],
    specialties: ['Mehrangarh Fort', 'Desert Safari', 'Photography Tours', 'Village Camping'],
    hourlyRate: 700,
    rating: 4.7, totalReviews: 89,
    isVerified: true,
  },
  // ── Uttar Pradesh ──────────────────────────────────────
  {
    name: 'Rahul Gupta',
    email: 'rahul.gupta@indiguide.in',
    state: 'Uttar Pradesh', city: 'Agra',
    location: 'Agra, Uttar Pradesh',
    bio: 'Third-generation guide family. Let me tell you the true love story behind the Taj Mahal, explore Agra Fort, and discover Fatehpur Sikri with expert commentary.',
    languages: ['Hindi', 'English', 'Urdu'],
    specialties: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mughal History', 'Marble Craft'],
    hourlyRate: 900,
    rating: 4.8, totalReviews: 212,
    isVerified: true,
  },
  {
    name: 'Sneha Pandey',
    email: 'sneha.pandey@indiguide.in',
    state: 'Uttar Pradesh', city: 'Varanasi',
    location: 'Varanasi, Uttar Pradesh',
    bio: 'Spiritual guide for the City of Light. I offer Ganga Aarti experiences, dawn boat rides, temple trails, and deep dives into the 3000+ year old culture of Kashi.',
    languages: ['Hindi', 'English', 'Sanskrit', 'Bengali'],
    specialties: ['Ganga Aarti', 'Boat Rides', 'Pilgrimage Tours', 'Silk Weaving', 'Meditation Walks'],
    hourlyRate: 650,
    rating: 4.9, totalReviews: 185,
    isVerified: true,
  },
  // ── Kerala ─────────────────────────────────────────────
  {
    name: 'Anjali Nair',
    email: 'anjali.nair@indiguide.in',
    state: 'Kerala', city: 'Kochi',
    location: 'Kochi, Kerala',
    bio: 'Welcome to God\'s Own Country! I specialize in backwater houseboat experiences, Kathakali performances, spice plantation tours and Fort Kochi colonial history.',
    languages: ['Malayalam', 'English', 'Tamil', 'Hindi'],
    specialties: ['Backwaters', 'Kathakali', 'Spice Farms', 'Fort Kochi', 'Ayurvedic Tours'],
    hourlyRate: 750,
    rating: 4.8, totalReviews: 97,
    isVerified: true,
  },
  {
    name: 'Krishna Menon',
    email: 'krishna.menon@indiguide.in',
    state: 'Kerala', city: 'Munnar',
    location: 'Munnar, Kerala',
    bio: 'Trekking and nature specialist in the Munnar hills. Tea plantation tours, Eravikulam National Park, Neelakurinji bloom trails, and waterfall hikes are my expertise.',
    languages: ['Malayalam', 'English', 'Hindi'],
    specialties: ['Tea Plantations', 'Trekking', 'Wildlife Safari', 'Waterfall Hikes', 'Bird Watching'],
    hourlyRate: 600,
    rating: 4.6, totalReviews: 73,
    isVerified: false,
  },
  // ── Maharashtra ────────────────────────────────────────
  {
    name: 'Vikram Joshi',
    email: 'vikram.joshi@indiguide.in',
    state: 'Maharashtra', city: 'Mumbai',
    location: 'Mumbai, Maharashtra',
    bio: 'Born Mumbaikar. I run curated Dharavi slum tours with dignity, Bollywood studio visits, Elephanta Caves day trips, and street food crawls from Juhu to Mohammad Ali Road.',
    languages: ['Marathi', 'Hindi', 'English', 'Gujarati'],
    specialties: ['Dharavi Tour', 'Bollywood', 'Elephanta Caves', 'Street Food', 'Film City'],
    hourlyRate: 1000,
    rating: 4.7, totalReviews: 156,
    isVerified: true,
  },
  {
    name: 'Meera Kulkarni',
    email: 'meera.kulkarni@indiguide.in',
    state: 'Maharashtra', city: 'Pune',
    location: 'Pune, Maharashtra',
    bio: 'Historian and heritage guide for Pune — Shaniwar Wada, Aga Khan Palace, Osho Ashram trails, and the forts of the Deccan. I offer bicycle tours of the old city too!',
    languages: ['Marathi', 'Hindi', 'English'],
    specialties: ['Shaniwar Wada', 'Heritage Walks', 'Bicycle Tours', 'Deccan Forts', 'Food Tours'],
    hourlyRate: 700,
    rating: 4.5, totalReviews: 62,
    isVerified: true,
  },
  // ── Tamil Nadu ─────────────────────────────────────────
  {
    name: 'Suresh Pillai',
    email: 'suresh.pillai@indiguide.in',
    state: 'Tamil Nadu', city: 'Chennai',
    location: 'Chennai, Tamil Nadu',
    bio: 'Chennai-born cultural ambassador. I offer temple tours of Kapaleeshwarar & Parthasarathy, Marina Beach walks, Carnatic music experiences, and filter coffee trails.',
    languages: ['Tamil', 'English', 'Telugu', 'Malayalam'],
    specialties: ['Temple Tours', 'Classical Music', 'Marina Beach', 'Filter Coffee', 'Art Museum'],
    hourlyRate: 600,
    rating: 4.6, totalReviews: 84,
    isVerified: true,
  },
  {
    name: 'Lakshmi Subramanian',
    email: 'lakshmi.s@indiguide.in',
    state: 'Tamil Nadu', city: 'Madurai',
    location: 'Madurai, Tamil Nadu',
    bio: 'Madurai is the Temple City and I am its storyteller. The Meenakshi Amman Temple is my home ground — moonlit tours, float festival timing, and Tamil cuisine deep-dives.',
    languages: ['Tamil', 'English', 'Hindi'],
    specialties: ['Meenakshi Temple', 'Night Tours', 'Sri Rangam', 'Chettinad Cuisine', 'Silk Sarees'],
    hourlyRate: 550,
    rating: 4.8, totalReviews: 101,
    isVerified: true,
  },
  // ── West Bengal ────────────────────────────────────────
  {
    name: 'Debashish Banerjee',
    email: 'debashish.b@indiguide.in',
    state: 'West Bengal', city: 'Kolkata',
    location: 'Kolkata, West Bengal',
    bio: 'I offer Kolkata through the lens of its literary, artistic and culinary legacy — Tagore\'s Jorasanko, the Marble Palace, tram rides, and the best mishti doi in the city.',
    languages: ['Bengali', 'Hindi', 'English'],
    specialties: ['Heritage Tram Tours', 'Rabindranath Tagore', 'Book Market', 'Rosogolla Trail', 'Victoria Memorial'],
    hourlyRate: 600,
    rating: 4.7, totalReviews: 109,
    isVerified: true,
  },
  {
    name: 'Riya Ghosh',
    email: 'riya.ghosh@indiguide.in',
    state: 'West Bengal', city: 'Darjeeling',
    location: 'Darjeeling, West Bengal',
    bio: 'Tea sommelier and mountain trekker. Enjoy sunrise views of Kanchenjunga from Tiger Hill, toy train rides, tea garden walks, and Tibetan monastery circuits.',
    languages: ['Bengali', 'Hindi', 'English', 'Nepali'],
    specialties: ['Tea Garden Tours', 'Toy Train', 'Tiger Hill Sunrise', 'Monastery Visits', 'Trekking'],
    hourlyRate: 650,
    rating: 4.9, totalReviews: 77,
    isVerified: true,
  },
  // ── Goa ────────────────────────────────────────────────
  {
    name: 'Carlos Fernandes',
    email: 'carlos.f@indiguide.in',
    state: 'Goa', city: 'Panaji',
    location: 'Panaji, Goa',
    bio: 'Third-generation Goan Portuguese-influenced guide. Old Goa churches, secret spice farms, feni distillery tours, and sunset cruises on the Mandovi River.',
    languages: ['Konkani', 'English', 'Hindi', 'Marathi'],
    specialties: ['Old Goa Churches', 'Spice Farm', 'Feni Distillery', 'Sunset Cruise', 'Beach Shacks'],
    hourlyRate: 850,
    rating: 4.6, totalReviews: 143,
    isVerified: true,
  },
  {
    name: 'Sonia D\'Souza',
    email: 'sonia.dsouza@indiguide.in',
    state: 'Goa', city: 'Margao',
    location: 'South Goa',
    bio: 'South Goa specialist — secluded beaches, Colva heritage walks, Palolem kayaking, and the untouched hinterland village trails. I keep it away from the tourist crowds.',
    languages: ['Konkani', 'English', 'Hindi'],
    specialties: ['Private Beach Tours', 'Kayaking', 'Village Trails', 'Yoga Retreats', 'Seafood Trails'],
    hourlyRate: 750,
    rating: 4.5, totalReviews: 58,
    isVerified: false,
  },
  // ── Himachal Pradesh ───────────────────────────────────
  {
    name: 'Rohan Thakur',
    email: 'rohan.thakur@indiguide.in',
    state: 'Himachal Pradesh', city: 'Manali',
    location: 'Manali, Himachal Pradesh',
    bio: 'Adventure guide and mountaineer with 8 years experience in the Kullu-Manali valley. Rohtang Pass snow expeditions, Solang Valley, Parvati Valley treks, and Hadimba Temple.',
    languages: ['Hindi', 'English', 'Punjabi', 'Pahari'],
    specialties: ['Rohtang Pass', 'Snow Activities', 'Trekking', 'River Rafting', 'Paragliding'],
    hourlyRate: 900,
    rating: 4.8, totalReviews: 192,
    isVerified: true,
  },
  {
    name: 'Kamla Devi',
    email: 'kamla.devi@indiguide.in',
    state: 'Himachal Pradesh', city: 'Dharamshala',
    location: 'Dharamshala, Himachal Pradesh',
    bio: 'Buddhist culture and Tibetan heritage specialist. Mcleod Ganj temples, Dalai Lama\'s monastery, Kangra Valley treks, and authentic thukpa cooking classes.',
    languages: ['Hindi', 'English', 'Tibetan', 'Punjabi'],
    specialties: ['Tibetan Culture', 'Monastery Tours', 'Yoga Campus', 'Kangra Fort', 'Buddhist Meditation'],
    hourlyRate: 700,
    rating: 4.7, totalReviews: 88,
    isVerified: true,
  },
  // ── Gujarat ────────────────────────────────────────────
  {
    name: 'Hardik Patel',
    email: 'hardik.patel@indiguide.in',
    state: 'Gujarat', city: 'Ahmedabad',
    location: 'Ahmedabad, Gujarat',
    bio: 'Sabarmati Ashram heritage expert and proud Amdavadi. Pols of the old city, night market food tours, stepwells of Gujarat, and Rann of Kutch seasonal expeditions.',
    languages: ['Gujarati', 'Hindi', 'English'],
    specialties: ['Sabarmati Ashram', 'Stepwells', 'Rann of Kutch', 'Night Food Tours', 'Pols Heritage Walk'],
    hourlyRate: 700,
    rating: 4.6, totalReviews: 95,
    isVerified: true,
  },
  // ── Karnataka ──────────────────────────────────────────
  {
    name: 'Kavitha Reddy',
    email: 'kavitha.reddy@indiguide.in',
    state: 'Karnataka', city: 'Bangalore',
    location: 'Bengaluru, Karnataka',
    bio: 'Tech city meets garden city — I blend Bengaluru\'s startup culture with Lalbagh gardens, Tipu Sultan\'s Summer Palace, Cubbon Park, and the craft beer trail.',
    languages: ['Kannada', 'Telugu', 'English', 'Hindi'],
    specialties: ['Lalbagh Gardens', 'Tipu Sultan Palace', 'Microbrewery Tours', 'Tech Park Tours', 'Lakes Walk'],
    hourlyRate: 750,
    rating: 4.5, totalReviews: 66,
    isVerified: false,
  },
  {
    name: 'Siddharth Rao',
    email: 'siddharth.rao@indiguide.in',
    state: 'Karnataka', city: 'Mysuru',
    location: 'Mysuru, Karnataka',
    bio: 'Royal city of Mysore — the magnificent Mysore Palace, Chamundi Hills, Brindavan Gardens, and silk weaving clusters. Dasara festival special guide since 2016.',
    languages: ['Kannada', 'English', 'Hindi', 'Tamil'],
    specialties: ['Mysore Palace', 'Chamundi Hills', 'Silk Weaving', 'Dasara Festival', 'Brindavan Gardens'],
    hourlyRate: 650,
    rating: 4.8, totalReviews: 118,
    isVerified: true,
  },
  // ── Delhi ──────────────────────────────────────────────
  {
    name: 'Aisha Khan',
    email: 'aisha.khan@indiguide.in',
    state: 'Delhi', city: 'New Delhi',
    location: 'New Delhi, Delhi',
    bio: 'Delhi in 48 hours — I\'ll show you Mughal Delhi, colonial Lutyens Delhi, and modern New Delhi. Chandni Chowk rickshaw rides, Qutub Minar, India Gate, and rooftop dinners.',
    languages: ['Hindi', 'Urdu', 'English', 'Punjabi'],
    specialties: ['Chandni Chowk', 'Red Fort', 'Qutub Minar', 'Old Delhi Rickshaw', 'Mughal Cuisine'],
    hourlyRate: 950,
    rating: 4.9, totalReviews: 231,
    isVerified: true,
  },
];

// ──────────────────────────────────────────────────────────────
//  SYNTHETIC TOURIST REVIEWS added to each guide
// ──────────────────────────────────────────────────────────────
const SAMPLE_REVIEWS = [
  { name: 'Tanvir Ahmed', rating: 5, comment: 'Absolutely fantastic experience! Highly recommended.' },
  { name: 'Pritha Sen', rating: 5, comment: 'The best guide I have ever had in India. Very knowledgeable.' },
  { name: 'James Wilson', rating: 4, comment: 'Great tour, very professional and punctual.' },
  { name: 'Sophie Martin', rating: 5, comment: 'Made our trip to India unforgettable.' },
  { name: 'Riya Kapoor', rating: 4, comment: 'Very informative and friendly guide.' },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected to MongoDB');

  const hashedPw = await bcrypt.hash('Guide@1234', 12);

  let inserted = 0;
  let skipped = 0;

  for (const data of GUIDES_DATA) {
    // Check if user already exists
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      console.log(`⏭  Skipping ${data.email} — already exists`);
      skipped++;
      continue;
    }

    // Create User
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPw,
      role: 'guide',
    });

    // Pick 2-3 sample reviews
    const reviews = SAMPLE_REVIEWS.slice(0, Math.floor(Math.random() * 2) + 2).map((r) => ({
      tourist: new mongoose.Types.ObjectId(),
      touristName: r.name,
      rating: r.rating,
      comment: r.comment,
    }));

    const totalReviews = reviews.length;
    const rating = +(reviews.reduce((a, r) => a + r.rating, 0) / totalReviews).toFixed(1);

    // Create Guide profile
    await Guide.create({
      user: user._id,
      bio: data.bio,
      location: data.location,
      state: data.state,
      city: data.city,
      languages: data.languages,
      specialties: data.specialties,
      hourlyRate: data.hourlyRate,
      rating: data.rating,
      totalReviews: data.totalReviews,
      reviews,
      isVerified: data.isVerified,
      availability: [],
    });

    console.log(`✅ Created guide: ${data.name} (${data.city}, ${data.state})`);
    inserted++;
  }

  console.log(`\n🎉 Done! Inserted ${inserted} guides, skipped ${skipped}.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
