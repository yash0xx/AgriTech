import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../components/brand/Logo';
import { ShieldCheck, Lock, Sprout } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070D0A] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Precision Agriculture Data Grid & Furrow Lines Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="agri-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />
            <circle cx="24" cy="24" r="1" fill="rgba(16, 185, 129, 0.12)" />
          </pattern>
          <linearGradient id="fieldFurrowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
            <stop offset="35%" stopColor="#10B981" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#059669" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fieldFurrowGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0" />
            <stop offset="45%" stopColor="#34D399" stopOpacity="0.18" />
            <stop offset="80%" stopColor="#059669" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#065F46" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Subtle IoT / Data grid */}
        <rect width="100%" height="100%" fill="url(#agri-grid-pattern)" />

        {/* Abstract Field Furrow / Terrace Topographic Lines */}
        <g strokeWidth="1.5" fill="none">
          <path d="M-100,180 C320,80 620,380 1200,240 C1550,150 1850,300 2200,200" stroke="url(#fieldFurrowGrad1)" />
          <path d="M-100,240 C320,140 620,440 1200,300 C1550,210 1850,360 2200,260" stroke="url(#fieldFurrowGrad1)" strokeDasharray="6 6" />
          <path d="M-100,300 C320,200 620,500 1200,360 C1550,270 1850,420 2200,320" stroke="url(#fieldFurrowGrad1)" />

          <path d="M-100,580 C380,480 720,740 1300,580 C1620,500 1920,640 2200,560" stroke="url(#fieldFurrowGrad2)" />
          <path d="M-100,640 C380,540 720,800 1300,640 C1620,560 1920,700 2200,620" stroke="url(#fieldFurrowGrad2)" strokeDasharray="8 6" />
          <path d="M-100,700 C380,600 720,860 1300,700 C1620,620 1920,760 2200,680" stroke="url(#fieldFurrowGrad2)" />
        </g>
      </svg>

      {/* Subtle radial ambient glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-[500px] h-[350px] bg-teal-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      {/* Minimal Top Brand Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link to="/login" className="flex items-center gap-2 group transition-opacity">
          <Logo isDark={true} variant="mobile" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-emerald-300/80 bg-emerald-950/40 border border-emerald-500/20 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline font-medium">Enterprise Agricultural Platform</span>
          <span className="sm:hidden font-medium">Secure B2B Portal</span>
        </div>
      </header>

      {/* Centered Main Authentication Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 z-10">
        <div className="w-full max-w-[440px]">
          <Outlet />
        </div>
      </main>

      {/* Clean Footer Bar */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-5 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2.5 z-10 border-t border-emerald-950/40">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />
          <span>Protected by 256-bit Supabase Authentication &bull; RLS Guarded</span>
        </div>
        <p className="flex items-center gap-1.5 text-slate-500">
          <Sprout className="w-3 h-3 text-emerald-500/60" />
          &copy; {new Date().getFullYear()} AgriTech. Smart Agricultural Marketplace.
        </p>
      </footer>
    </div>
  );
};
