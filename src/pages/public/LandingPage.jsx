import { Link } from 'react-router-dom';
import { Search, Map, Shield, Calendar, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center max-w-7xl mx-auto w-full">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Discover places with <br className="hidden md:block"/>
          <span className="text-gradient">Local Experts</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Connect with trusted local guides across India. Book authentic experiences and explore cities with true locals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/tourist/search" className="px-8 py-4 bg-[var(--color-primary-600)] text-white font-bold rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:bg-[var(--color-primary-500)] transition-all flex items-center justify-center gap-2">
            <Search size={20} /> Find a Guide
          </Link>
          <Link to="/register" className="px-8 py-4 bg-white text-slate-800 font-bold rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:bg-slate-50 border border-slate-100 transition-all flex items-center justify-center gap-2">
            Become a Guide <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Map, title: "Authentic Experiences", desc: "Get off the beaten path with locals who know the city best." },
              { icon: Shield, title: "Verified Guides", desc: "Every guide is vetted and reviewed by our community." },
              { icon: Calendar, title: "Instant Booking", desc: "Choose your dates, pay securely, and you're ready to go!" }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-3xl transition-transform hover:-translate-y-2">
                <div className="w-14 h-14 bg-blue-100 text-[var(--color-primary-600)] rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}