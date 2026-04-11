import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, UserPlus, Compass, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('tourist');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    if (password !== confirm) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    try {
      const user = await register(name, email, password, role);
      navigate(`/${user.role}/dashboard`);
    } catch {
      // error is shown via context
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl card-shadow border border-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 text-[var(--color-primary-600)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Create an Account</h2>
          <p className="mt-3 text-slate-500">Join our community today</p>
        </div>

        {/* Role Selector */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          {[
            { value: 'tourist', label: 'I am a Tourist', icon: Compass },
            { value: 'guide', label: 'I am a Guide', icon: User },
          ].map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all ${
                  role === r.value ? 'bg-white text-[var(--color-primary-600)] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={16} /> {r.label}
              </button>
            );
          })}
        </div>

        {displayError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {displayError}
          </div>
        )}

        <form className="mt-2 space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                id="register-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors outline-none"
                placeholder="Min. 6 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                id="register-confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-slate-50 focus:bg-white transition-colors outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}