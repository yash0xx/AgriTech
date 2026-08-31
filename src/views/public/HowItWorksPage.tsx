import React from 'react';
import { UserRole } from '../../types';
import { 
  Sprout, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  Truck, 
  Scale, 
  CreditCard, 
  ArrowRight,
  FileCheck,
  Building2,
  Lock,
  BadgePercent
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (view: string) => void;
  onOpenAuthModal: (role?: UserRole) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onNavigate,
  onOpenAuthModal,
}) => {
  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-20">
      
      {/* Header Banner */}
      <div className="bg-[#002517] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9DF1C0]">
            Transparent Marketplace Protocol
          </span>
          <h1 className="text-3xl sm:text-5xl font-black">
            How AgriTech Works
          </h1>
          <p className="text-xs sm:text-sm text-[#C1C8C2] max-w-xl mx-auto">
            From farm-gate listing to verified bank payout, see how our zero-commission direct model protects both farmers and buyers.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        
        {/* Farmer Journey vs Buyer Journey Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* FARMER JOURNEY */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7DDC8] shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E7DDC8]">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F0E8] flex items-center justify-center text-[#0D6C45]">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#002517]">For Farmers & Sellers</h2>
                <span className="text-xs text-[#717973]">Get better rates than local middleman cartels</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#002517] text-[#9DF1C0] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <h3 className="text-xs font-bold text-[#002517]">Upload Crop & Expected Price</h3>
                  <p className="text-xs text-[#525B54] mt-0.5">Enter harvest date, quantity, and photos with live APMC mandi benchmark suggestions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#002517] text-[#9DF1C0] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <h3 className="text-xs font-bold text-[#002517]">Review Direct Buyer Offers</h3>
                  <p className="text-xs text-[#525B54] mt-0.5">Receive formal purchase requests from wholesalers and retail chains. Accept or counter-offer.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#002517] text-[#9DF1C0] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <div>
                  <h3 className="text-xs font-bold text-[#002517]">100% Escrow Guarantee</h3>
                  <p className="text-xs text-[#525B54] mt-0.5">Produce is dispatched only after buyer's payment is fully secured in AgriTech Escrow.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#002517] text-[#9DF1C0] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                <div>
                  <h3 className="text-xs font-bold text-[#002517]">Farm Gate Pickup & Instant Credit</h3>
                  <p className="text-xs text-[#525B54] mt-0.5">AgriLogistics truck arrives at farm. Funds are deposited directly to your bank upon QC approval.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuthModal('farmer', 'register')}
              className="w-full bg-[#002517] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <span>Register as Farmer</span>
              <ArrowRight className="w-4 h-4 text-[#9DF1C0]" />
            </button>
          </div>

          {/* BUYER JOURNEY */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7DDC8] shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E7DDC8]">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF8E7] flex items-center justify-center text-[#C2962A]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#002517]">For Buyers & Traders</h2>
                <span className="text-xs text-[#717973]">Direct farm gate sourcing with verified quality</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#002517] text-[#FFDF9E] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <h3 className="text-xs font-bold text-[#002517]">Search & Compare Harvests</h3>
                  <p className="text-xs text-[#525B54] mt-0.5">Filter by crop grade, variety, moisture level, harvest date, and distance from your godown.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#002517] text-[#FFDF9E] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <h3 className="text-xs font-bold text-[#002517]">Submit Purchase Request / Offer</h3>
                  <p className="text-xs text-[#525B54] mt-0.5">Lock quantity or negotiate bulk tonnage terms directly with verified KYC farmers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#002517] text-[#FFDF9E] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <div>
                  <h3 className="text-xs font-bold text-[#002517]">Safe Escrow Deposit</h3>
                  <p className="text-xs text-[#525B54] mt-0.5">Deposit into secure escrow. Funds are strictly protected until produce arrives as described.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#002517] text-[#FFDF9E] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                <div>
                  <h3 className="text-xs font-bold text-[#002517]">Doorstep Unloading & Sign-off</h3>
                  <p className="text-xs text-[#525B54] mt-0.5">Inspect batch quality and digital weighbridge slip, approve delivery with 1-click on mobile.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuthModal('buyer', 'register')}
              className="w-full bg-[#E6F0E8] text-[#002517] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-[#D7E4DA]"
            >
              <span>Register as Buyer</span>
              <ArrowRight className="w-4 h-4 text-[#0D6C45]" />
            </button>
          </div>
        </div>

        {/* The 4 Pillars of Trust */}
        <div className="bg-[#002517] text-white p-8 sm:p-10 rounded-3xl space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#9DF1C0] uppercase tracking-wider">Security & Quality</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">The Four Pillars of AgriTech Trust</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Lock className="w-6 h-6 text-[#9DF1C0]" />
              <h3 className="text-xs font-bold text-white">Digital Escrow Vault</h3>
              <p className="text-[11px] text-[#C1C8C2]">Zero risk of defaults or bounced payments for either party.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <FileCheck className="w-6 h-6 text-[#9DF1C0]" />
              <h3 className="text-xs font-bold text-white">100% KYC Verification</h3>
              <p className="text-[11px] text-[#C1C8C2]">7/12 Land records, Aadhaar, and GSTIN trade credentials verified.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <BadgePercent className="w-6 h-6 text-[#9DF1C0]" />
              <h3 className="text-xs font-bold text-white">0% Farmer Commission</h3>
              <p className="text-[11px] text-[#C1C8C2]">Farmers receive 100% of their quoted price with zero deductions.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Truck className="w-6 h-6 text-[#9DF1C0]" />
              <h3 className="text-xs font-bold text-white">GPS Farm Freight</h3>
              <p className="text-[11px] text-[#C1C8C2]">Calibrated scales & continuous transit tracking from farm gate.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
