import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { ShieldCheck, Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

interface FooterProps {
  onNavigate?: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate: propNavigate }) => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    if (propNavigate) propNavigate(path);
  };

  const getDashboardPath = () => {
    if (role === 'FARMER') return '/farmer';
    if (role === 'SELLER') return '/seller';
    if (role === 'BUYER') return '/buyer';
    if (role === 'ADMIN') return '/admin';
    return '/login';
  };

  return (
    <footer className="bg-[#002517] text-white border-t border-[#123B2A] pt-14 pb-24 md:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-white/10">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="desktop" isDark={true} onClick={() => handleNav(getDashboardPath())} />
            <p className="text-xs text-[#C1C8C2] leading-relaxed max-w-sm">
              AgriTech bridges Indian farmers directly with commercial buyers, mandis, and food businesses. Transparent mandi rates, digital escrow settlements, and verified farm-gate logistics.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-[#9DF1C0]">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-[#9DF1C0]" />
                <span className="font-semibold">100% Escrow Protected Trades</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[#FFDF9E]">
                <Sparkles className="w-4 h-4 text-[#FFDF9E]" />
                <span className="font-semibold">Live APMC Price Synced</span>
              </div>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9DF1C0] mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C1C8C2]">
              <li>
                <button onClick={() => handleNav('/marketplace')} className="hover:text-white transition-colors cursor-pointer">
                  Fresh Produce
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/market-prices')} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
                  <span>Live Mandi Rates</span>
                  <span className="text-[9px] bg-[#0D6C45] text-white px-1.5 py-0.2 rounded-full font-bold">LIVE</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/logistics')} className="hover:text-white transition-colors cursor-pointer">
                  AgriLogistics Estimator
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                  How Escrow Works
                </button>
              </li>
            </ul>
          </div>

          {/* Portals & Roles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9DF1C0] mb-4">
              Portals & Roles
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C1C8C2]">
              <li>
                <button onClick={() => handleNav('/farmer')} className="hover:text-white transition-colors cursor-pointer">
                  Farmer / Producer Portal
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/seller')} className="hover:text-white transition-colors cursor-pointer">
                  Seller / Merchant Portal
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/farmer/products/new')} className="hover:text-white transition-colors cursor-pointer">
                  Post Crop Listing
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/buyer')} className="hover:text-white transition-colors cursor-pointer">
                  Buyer / Trader Portal
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/admin')} className="hover:text-white transition-colors text-amber-300 cursor-pointer">
                  Admin Command Portal
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/admin/team')} className="hover:text-white transition-colors text-purple-300 cursor-pointer">
                  Engineering Team (6)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9DF1C0] mb-4">
              Direct Farmer Support
            </h4>
            <div className="space-y-3 text-xs text-[#C1C8C2]">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#9DF1C0] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-semibold">1800 233 4455</span>
                  <span className="text-[10px] text-[#C1C8C2]">Toll-Free (Mon-Sat, 6 AM - 8 PM)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#9DF1C0] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-semibold">support@agritech.in</span>
                  <span className="text-[10px] text-[#C1C8C2]">Farmer Helpdesk & Mandi Desk</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#9DF1C0] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-semibold">AgriTech Hubs</span>
                  <span className="text-[10px] text-[#C1C8C2]">Pune • Nashik • Mumbai • Ahmednagar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#C1C8C2]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} AgriTech Network Pvt. Ltd.</span>
            <span>•</span>
            <span className="text-[#9DF1C0]">From Farm to Buyer</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => handleNav('/about')} className="hover:text-white transition-colors cursor-pointer">About Us</button>
            <button onClick={() => handleNav('/how-it-works')} className="hover:text-white transition-colors cursor-pointer">Terms of Trade</button>
            <button onClick={() => handleNav('/how-it-works')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => handleNav('/market-prices')} className="hover:text-white transition-colors cursor-pointer">Mandi Rules</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
