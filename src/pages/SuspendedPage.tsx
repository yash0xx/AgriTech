import React from 'react';
import { useAuth } from '../auth/useAuth';
import { ShieldAlert, Mail, PhoneCall, LogOut } from 'lucide-react';

export const SuspendedPage: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 shadow-2xl shadow-red-950/20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-8 h-8 text-red-400" />
      </div>

      <h1 className="text-2xl font-bold text-white tracking-tight">Account Suspended</h1>
      <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
        Hello <span className="text-white font-semibold">{profile?.fullName || 'User'}</span>, your platform access has been temporarily held pending administrative or compliance review.
      </p>

      <div className="mt-6 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Need assistance or wish to appeal?
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>compliance@agritech.com</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>+91 1800-AGRI-SAFE (Toll Free)</span>
        </div>
      </div>

      <button
        onClick={() => signOut()}
        className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium py-2.5 px-4 rounded-xl border border-slate-700 transition-colors cursor-pointer text-sm"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out from Account</span>
      </button>
    </div>
  );
};
