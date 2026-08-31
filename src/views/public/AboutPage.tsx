import React from 'react';
import { Logo } from '../../components/brand/Logo';
import { 
  Sprout, 
  MapPin, 
  Users, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string) => void;
  onOpenAuthModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  onOpenAuthModal,
}) => {
  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-20">
      {/* Header Banner */}
      <div className="bg-[#002517] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9DF1C0]">
            Our Mission & Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-black">
            From Farm to Buyer. <br />
            <span className="text-[#9DF1C0]">Directly, Digitally, Transparently.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#C1C8C2] max-w-xl mx-auto">
            We are building India's most transparent agricultural commerce network, empowering farmers with direct market access, real-time APMC price benchmarks, and secure digital settlements.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        
        {/* Core Narrative */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E7DDC8] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E7DDC8]">
            <Logo variant="app-icon" />
            <div>
              <h2 className="text-xl font-bold text-[#002517]">The AgriTech Promise</h2>
              <p className="text-xs text-[#717973]">Reimagining India's agricultural supply chain from the ground up.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#525B54] leading-relaxed">
            <p>
              For decades, hardworking Indian farmers have been trapped in opaque mandi distribution chains, losing up to 30-40% of their harvest value to middlemen, unverified weighbridge discrepancies, and payment delays.
            </p>
            <p>
              AgriTech changes this by creating a direct electronic marketplace where verified farmers list produce directly to commercial food processors, supermarket chains, and wholesale traders with live APMC benchmark parity.
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E7DDC8]">
            <div className="p-4 rounded-2xl bg-[#F7F5EF]">
              <span className="text-2xl font-black text-[#002517] block">12,400+</span>
              <span className="text-xs text-[#717973]">Enrolled Farmers</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF]">
              <span className="text-2xl font-black text-[#002517] block">4,800+</span>
              <span className="text-xs text-[#717973]">Verified Buyers</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF]">
              <span className="text-2xl font-black text-[#002517] block">24 Mandis</span>
              <span className="text-xs text-[#717973]">Live Price Feeds</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF]">
              <span className="text-2xl font-black text-[#002517] block">₹84.2 Lakh</span>
              <span className="text-xs text-[#717973]">Monthly Trade GMV</span>
            </div>
          </div>
        </div>

        {/* Regional Hubs */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7DDC8] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#002517]">AgriTech Operational Hubs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#002517]">
                <MapPin className="w-3.5 h-3.5 text-[#0D6C45]" />
                <span>Nashik Agritech Hub</span>
              </div>
              <p className="text-[11px] text-[#525B54]">Specializing in Grape, Onion & Tomato cold logistics.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#002517]">
                <MapPin className="w-3.5 h-3.5 text-[#0D6C45]" />
                <span>Pune APMC Operations</span>
              </div>
              <p className="text-[11px] text-[#525B54]">Central trade exchange, grain grading, and tech team.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#002517]">
                <MapPin className="w-3.5 h-3.5 text-[#0D6C45]" />
                <span>Navi Mumbai Port Logistics</span>
              </div>
              <p className="text-[11px] text-[#525B54]">Wholesale buyer dispatch terminal & quality laboratory.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
