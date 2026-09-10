import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { Logo } from '../components/brand/Logo';
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Sprout,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        if (role === 'FARMER') navigate('/farmer', { replace: true });
        else if (role === 'SELLER') navigate('/seller', { replace: true });
        else if (role === 'BUYER') navigate('/buyer', { replace: true });
        else if (role === 'ADMIN') navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Brand & Heading Section */}
      <div className="flex flex-col items-center text-center mb-6">
        <Link
          to="/"
          aria-label="AgriTech Home"
          className="inline-flex flex-col items-center group mb-3 transition-transform duration-200 hover:scale-[1.02]"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#0E2419] to-[#05140D] border border-emerald-500/25 p-2.5 shadow-xl shadow-emerald-950/60 flex items-center justify-center group-hover:border-emerald-400/40 group-hover:shadow-emerald-500/15 transition-all">
            <Logo variant="icon-only" isDark={true} />
          </div>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Agri<span className="text-emerald-400">Tech</span>
            </span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/80 mt-0.5">
            Smart Agricultural Marketplace
          </span>
        </Link>

        <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight mt-1">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
          Sign in to your AgriTech account
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-[#0B1410]/95 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
        {/* Subtle top card radiance line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

        {/* Error State */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-5 flex items-start gap-2.5 bg-red-950/40 border border-red-500/30 text-red-200 text-xs sm:text-sm p-3.5 rounded-xl animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Address Field */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500/70">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-12 bg-[#060D09]/80 border border-emerald-950/80 hover:border-emerald-800/60 rounded-xl pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500/70">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                // Form security baseline: type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 bg-[#060D09]/80 border border-emerald-950/80 hover:border-emerald-800/60 rounded-xl pl-10 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary CTA Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full h-12 mt-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:from-emerald-600 active:to-emerald-500 disabled:opacity-50 text-[#021C11] font-bold text-sm tracking-wide rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#021C11]" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 text-[#021C11]" />
              </>
            )}
          </button>
        </form>

        {/* Divider & Registration Section */}
        <div className="mt-6 pt-5 border-t border-emerald-950/80 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors ml-1"
          >
            Create account
          </Link>
        </div>
      </div>

      {/* Trust & Security Tagline */}
      <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1 text-emerald-400/90">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Secure
        </span>
        <span className="text-emerald-900">•</span>
        <span className="flex items-center gap-1 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400/80" />
          Smart
        </span>
        <span className="text-emerald-900">•</span>
        <span className="flex items-center gap-1 text-slate-300">
          <Sprout className="w-3.5 h-3.5 text-emerald-400/80" />
          Agricultural
        </span>
      </div>
    </div>
  );
};
