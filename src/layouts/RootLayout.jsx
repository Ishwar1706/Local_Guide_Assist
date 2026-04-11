import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function RootLayout() { 
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="glass-panel py-8 text-center text-slate-600 font-medium text-sm mt-auto border-t-0 rounded-t-3xl mx-4 sm:mx-8">
        &copy; {new Date().getFullYear()} Local Guide Booking System. All rights reserved.
      </footer>
    </div>
  ); 
}