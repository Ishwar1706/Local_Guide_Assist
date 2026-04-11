import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import AuthLayout from './layouts/AuthLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Tourist Pages
import TouristDashboard from './pages/tourist/Dashboard';
import SearchGuides from './pages/tourist/SearchGuides';
import GuideProfile from './pages/tourist/GuideProfile';
import BookingPage from './pages/tourist/BookingPage';
import MyBookings from './pages/tourist/MyBookings';
import TouristChat from './pages/tourist/Chat';

// Guide Pages
import GuideDashboard from './pages/guide/Dashboard';
import GuideProfileManage from './pages/guide/ProfileManage';
import GuideBookings from './pages/guide/Bookings';
import GuideAvailability from './pages/guide/Availability';
import GuideChat from './pages/guide/Chat';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login/:role?" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Tourist Routes */}
        <Route path="/tourist" element={<AuthLayout role="tourist" />}>
          <Route path="dashboard" element={<TouristDashboard />} />
          <Route path="search" element={<SearchGuides />} />
          <Route path="guide/:id" element={<GuideProfile />} />
          <Route path="book/:id" element={<BookingPage />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="chat" element={<TouristChat />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Guide Routes */}
        <Route path="/guide" element={<AuthLayout role="guide" />}>
          <Route path="dashboard" element={<GuideDashboard />} />
          <Route path="profile" element={<GuideProfileManage />} />
          <Route path="bookings" element={<GuideBookings />} />
          <Route path="availability" element={<GuideAvailability />} />
          <Route path="chat" element={<GuideChat />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AuthLayout role="admin" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
