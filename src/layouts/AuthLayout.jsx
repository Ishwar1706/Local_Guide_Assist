import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { LayoutDashboard, Users, UserCircle, Calendar, MessageSquare, Search, ClipboardList } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout({ role }) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect if user role doesn't match the route's expected role (admin can go anywhere)
  if (user && user.role !== role && user.role !== 'admin') {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  const getLinks = () => {
    switch (role) {
      case 'tourist':
        return [
          { name: 'Dashboard', path: '/tourist/dashboard', icon: LayoutDashboard },
          { name: 'Search Guides', path: '/tourist/search', icon: Search },
          { name: 'My Bookings', path: '/tourist/bookings', icon: Calendar },
          { name: 'Messages', path: '/tourist/chat', icon: MessageSquare },
        ];
      case 'guide':
        return [
          { name: 'Dashboard', path: '/guide/dashboard', icon: LayoutDashboard },
          { name: 'Profile', path: '/guide/profile', icon: UserCircle },
          { name: 'Booking Requests', path: '/guide/bookings', icon: ClipboardList },
          { name: 'Availability', path: '/guide/availability', icon: Calendar },
          { name: 'Messages', path: '/guide/chat', icon: MessageSquare },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Manage Users', path: '/admin/users', icon: Users },
          { name: 'Verify Guides', path: '/admin/verify', icon: UserCircle },
          { name: 'All Bookings', path: '/admin/bookings', icon: Calendar },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Sidebar */}
        <aside className="w-56 hidden md:block shrink-0">
          {/* User badge */}
          <div className="flex items-center gap-3 px-4 py-3 mb-4 glass-panel rounded-2xl">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=3b82f6&color=fff`}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                    isActive
                      ? 'glass-panel text-[var(--color-primary-600)] shadow-md'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  )}
                >
                  <Icon size={20} className={cn(isActive ? 'text-[var(--color-primary-600)]' : 'text-slate-400')} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}