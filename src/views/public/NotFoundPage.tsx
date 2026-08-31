import React from 'react';
import { Sprout, ArrowRight, Store, Home } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (view: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#F7F5EF]">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-[#E7DDC8] shadow-sm space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[#E6F0E8] flex items-center justify-center mx-auto text-[#0D6C45]">
          <Sprout className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#717973]">404 Error</span>
          <h1 className="text-2xl font-black text-[#002517]">Looks like this field is empty.</h1>
          <p className="text-xs text-[#525B54] leading-relaxed pt-1">
            The crop listing or page you're searching for couldn't be located in the current harvest cycle.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => onNavigate('landing')}
            className="flex-1 bg-[#F7F5EF] hover:bg-[#E6F0E8] text-[#002517] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>

          <button
            onClick={() => onNavigate('marketplace')}
            className="flex-1 bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Store className="w-4 h-4 text-[#9DF1C0]" />
            <span>Back to Marketplace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
