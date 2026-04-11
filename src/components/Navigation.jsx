import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogIn, UserPlus, Compass } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Search Guides', path: '/tourist/search' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold">
                <Compass size={20} />
              </div>
              <span className="font-bold text-xl text-slate-800">LocalGuide</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(n => (
              <Link key={n.name} to={n.path} className="text-slate-600 hover:text-[var(--color-primary-600)] font-medium transition-colors">
                {n.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to={`/${user.role}/dashboard`} className="text-slate-600 hover:text-[var(--color-primary-600)] font-medium transition-colors">
                  Dashboard({user.role})
                </Link>
                <button onClick={logout} className="text-slate-500 hover:text-red-500 font-medium">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-[var(--color-primary-600)] font-medium hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-2">
                  <LogIn size={18} /> Login
                </Link>
                <Link to="/register" className="px-5 py-2 bg-[var(--color-primary-600)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-500)] shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all flex items-center gap-2">
                  <UserPlus size={18} /> Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-700">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-1">
           {navLinks.map(n => (
              <Link key={n.name} to={n.path} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-[var(--color-primary-600)] hover:bg-slate-50">
                {n.name}
              </Link>
            ))}
        </div>
      )}
    </nav>
  );
}
