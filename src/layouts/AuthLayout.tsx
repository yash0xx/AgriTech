import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../components/brand/Logo';
import { ShieldCheck, Lock } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-between text-slate-100 relative overflow-hidden">
      {/* Subtle background ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link to="/login" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Logo isDark={true} />
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-full backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-bit Encrypted Agri-Marketplace</span>
        </div>
      </header>

      {/* Main content slot */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer bar */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 border-t border-slate-800/40">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Authorized Agricultural B2B Portal &bull; Supabase Auth Protected</span>
        </div>
        <p>&copy; {new Date().getFullYear()} AgriTech Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};
