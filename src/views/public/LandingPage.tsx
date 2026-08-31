import React, { useState } from 'react';
import { ProductListing, MandiMarketPrice, UserRole } from '../../types';
import { AIInsightCard } from '../../components/common/AIInsightCard';
import { 
  Sprout, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Star, 
  Sparkles, 
  Search, 
  ChevronRight,
  BadgeCheck,
  Scale,
  CreditCard,
  Building2,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface LandingPageProps {
  products: ProductListing[];
  marketPrices: MandiMarketPrice[];
  onNavigate: (view: string, extra?: any) => void;
  onOpenAuthModal: (role?: UserRole, tab?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  products,
  marketPrices,
  onNavigate,
  onOpenAuthModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { name: 'All', icon: '🌾' },
    { name: 'Vegetables', icon: '🥦' },
    { name: 'Fruits', icon: '🍎' },
    { name: 'Grains', icon: '🌾' },
    { name: 'Pulses', icon: '🫘' },
    { name: 'Oilseeds', icon: '🌻' },
    { name: 'Spices', icon: '🌶️' },
  ];

  const featuredProducts = products.filter(p => p.featured || p.status === 'Active').slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('marketplace', { query: searchQuery });
  };

  return (
    <div className="min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-[#F7F5EF] via-[#F2FCF3] to-[#F7F5EF] border-b border-[#E7DDC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-[#E6F0E8] border border-[#9DF1C0] px-3.5 py-1.5 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#0D6C45] animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#002517]">
                  India's Direct Agri Marketplace
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#002517] tracking-tight leading-[1.1]">
                  Your Harvest. <br />
                  Your Market. <br />
                  <span className="text-[#0D6C45] underline decoration-[#9DF1C0] decoration-wavy decoration-2">
                    Your Choice.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-[#525B54] font-normal leading-relaxed max-w-xl">
                  Connect directly with verified wholesale buyers, discover real-time mandi prices, and schedule farm-gate transport with 100% digital escrow safety.
                </p>
              </div>

              {/* Interactive Search & Filter Bar */}
              <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-2xl border border-[#C1C8C2]/80 shadow-lg flex flex-col sm:flex-row items-center gap-2 max-w-xl">
                <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 w-full">
                  <Search className="w-5 h-5 text-[#0D6C45] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search crops, onion, tomato, mandi..."
                    className="w-full bg-transparent text-sm text-[#002517] placeholder-[#717973] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#002517] hover:bg-[#123B2A] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                >
                  <span>Explore Market</span>
                  <ArrowRight className="w-4 h-4 text-[#9DF1C0]" />
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenAuthModal('farmer', 'register')}
                  className="bg-[#0D6C45] hover:bg-[#084D31] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  <Sprout className="w-4 h-4 text-[#9DF1C0]" />
                  <span>I am a Farmer (Sell Produce)</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal('buyer', 'register')}
                  className="bg-white hover:bg-[#E6F0E8] border border-[#C1C8C2] text-[#002517] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C2962A]" />
                  <span>I am a Buyer (Wholesale)</span>
                </button>
              </div>

              {/* Live Metric Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E7DDC8]/80 max-w-lg">
                <div>
                  <span className="block text-xl sm:text-2xl font-black text-[#002517]">12,400+</span>
                  <span className="text-[11px] font-medium text-[#717973]">Verified Farmers</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-black text-[#002517]">₹84.2 Lakh</span>
                  <span className="text-[11px] font-medium text-[#717973]">Monthly Volume</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-black text-[#002517]">100% Escrow</span>
                  <span className="text-[11px] font-medium text-[#717973]">Safe Settlements</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Live Market Pulse & Hero Card */}
            <div className="lg:col-span-5 space-y-4">
              {/* Highlight Card */}
              <div className="bg-white border border-[#E7DDC8] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E7DDC8]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#E6F0E8] flex items-center justify-center text-[#0D6C45]">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#002517]">Live Mandi Benchmark</h3>
                      <span className="text-[10px] text-[#717973]">APMC Real-time Spot Rates</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-[#9DF1C0] text-[#002517] px-2.5 py-1 rounded-full">
                    LIVE
                  </span>
                </div>

                {/* Price Highlights */}
                <div className="space-y-3">
                  {marketPrices.slice(0, 3).map((mp) => (
                    <div 
                      key={mp.id}
                      onClick={() => onNavigate('market-prices')}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F5EF] hover:bg-[#E6F0E8] transition-colors cursor-pointer border border-[#E7DDC8]"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-[#002517]">{mp.cropName}</h4>
                        <span className="text-[10px] text-[#717973] flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {mp.mandi}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-[#002517]">
                          ₹{mp.currentPrice}/kg
                        </div>
                        <span className={`text-[10px] font-bold ${
                          mp.trend === 'up' ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {mp.trend === 'up' ? '+' : ''}{mp.changePercentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E7DDC8] flex items-center justify-between text-xs">
                  <span className="text-[#717973] text-[11px]">Updated 15m ago from Nashik & Pune</span>
                  <button 
                    onClick={() => onNavigate('market-prices')}
                    className="text-[#0D6C45] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View all 24 mandis</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* AI Insight Card Component */}
              <AIInsightCard
                variant="banner"
                insight="Tomato demand is currently increasing around Pune (+8.4%). Direct farm gate pickup available for next 48 hours."
                actionLabel="View Demand"
                onAction={() => onNavigate('market-prices')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SELECTOR */}
      <section className="py-8 bg-white border-b border-[#E7DDC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#717973]">
              Browse Produce by Category
            </h3>
            <button
              onClick={() => onNavigate('marketplace')}
              className="text-xs font-bold text-[#0D6C45] hover:text-[#002517] flex items-center gap-1"
            >
              <span>View all listings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  onNavigate('marketplace', { category: cat.name === 'All' ? undefined : cat.name });
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
                  selectedCategory === cat.name
                    ? 'bg-[#002517] text-white border-[#002517] shadow-sm'
                    : 'bg-[#F7F5EF] text-[#525B54] border-[#E7DDC8] hover:border-[#0D6C45] hover:bg-[#E6F0E8]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED HARVEST CROPS */}
      <section className="py-14 bg-[#F7F5EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0D6C45] mb-1">
                <Sprout className="w-4 h-4" />
                <span>Verified Direct Listings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#002517]">
                Fresh Harvest Direct from Farm Gate
              </h2>
              <p className="text-xs sm:text-sm text-[#525B54] mt-1">
                Zero middlemen. Direct pricing with verified quality grading and digital weighbridge receipts.
              </p>
            </div>

            <button
              onClick={() => onNavigate('marketplace')}
              className="inline-flex items-center gap-2 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-98 shrink-0"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#9DF1C0]" />
            </button>
          </div>

          {/* Produce Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onNavigate('product-details', { product })}
                className="bg-white rounded-3xl border border-[#E7DDC8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden bg-[#E6F0E8]">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-[#002517]/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {product.grade}
                    </span>
                    {product.organicCertified && (
                      <span className="bg-[#9DF1C0] text-[#002517] text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Organic
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[#002517] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    {product.quantityAvailable} {product.unit} Available
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#717973] mb-1">
                      <span className="font-semibold text-[#0D6C45]">{product.category}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#717973]" />
                        {product.district}, {product.state}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#002517] group-hover:text-[#0D6C45] transition-colors line-clamp-1">
                      {product.title}
                    </h3>

                    {/* Farmer snippet */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E7DDC8]">
                      <img
                        src={product.farmer.avatar}
                        alt={product.farmer.name}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-[#525B54] truncate">
                        {product.farmer.name}
                      </span>
                      {product.farmer.isVerified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-[#0D6C45] shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Price Row */}
                  <div className="pt-2 border-t border-[#E7DDC8] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#717973]">Direct Farmer Price</div>
                      <div className="text-lg font-black text-[#002517]">
                        ₹{product.pricePerUnit}
                        <span className="text-xs font-medium text-[#717973]">/{product.unit}</span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('product-details', { product });
                      }}
                      className="bg-[#E6F0E8] group-hover:bg-[#002517] text-[#002517] group-hover:text-white p-2.5 rounded-xl transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW AGRITECH WORKS (Direct, Transparent, Protected) */}
      <section className="py-16 bg-white border-y border-[#E7DDC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6C45]">
              Seamless Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#002517] mt-1">
              How AgriTech Protects Every Deal
            </h2>
            <p className="text-xs sm:text-sm text-[#525B54] mt-2">
              From harvest to payout, every step is direct, digitally recorded, and escrow protected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-[#F7F5EF] p-6 rounded-3xl border border-[#E7DDC8] space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#002517] text-[#9DF1C0] flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-[#002517]">Farmer Lists Produce</h3>
              <p className="text-xs text-[#525B54] leading-relaxed">
                Farmer uploads crop quantity, photos, variety, and expected rate with live APMC benchmark guidance.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F7F5EF] p-6 rounded-3xl border border-[#E7DDC8] space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#002517] text-[#9DF1C0] flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-[#002517]">Buyer Makes Offer</h3>
              <p className="text-xs text-[#525B54] leading-relaxed">
                Wholesaler, retailer or food factory reviews quality grade and submits quote or instant purchase order.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F7F5EF] p-6 rounded-3xl border border-[#E7DDC8] space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#002517] text-[#9DF1C0] flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-[#002517]">Escrow Deposit Lock</h3>
              <p className="text-xs text-[#525B54] leading-relaxed">
                100% order amount is securely held in AgriTech Digital Escrow before produce leaves the farm gate.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#F7F5EF] p-6 rounded-3xl border border-[#E7DDC8] space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#002517] text-[#9DF1C0] flex items-center justify-center font-black text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-[#002517]">Pickup & Direct Payout</h3>
              <p className="text-xs text-[#525B54] leading-relaxed">
                AgriLogistics truck picks up at farm gate. On digital QC delivery sign-off, funds release directly to farmer's account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AGRILOGISTICS SPOTLIGHT */}
      <section className="py-16 bg-gradient-to-b from-[#F2FCF3] to-[#F7F5EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#002517] text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative shadow-2xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#9DF1C0]/20 border border-[#9DF1C0]/30 px-3 py-1 rounded-full text-xs font-bold text-[#9DF1C0]">
                  <Truck className="w-4 h-4" />
                  <span>Farm Gate to Buyer Logistics</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Doorstep Farm Freight. <br />
                  <span className="text-[#9DF1C0]">Zero Mandi Loading Delays.</span>
                </h2>

                <p className="text-xs sm:text-sm text-[#C1C8C2] leading-relaxed max-w-lg">
                  Book verified agricultural carriers (Tata Ace, 407 LCV, Refrigerated containers) directly matching your harvest weight and destination mandi.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onNavigate('logistics')}
                    className="bg-[#9DF1C0] hover:bg-[#86E4AD] text-[#002517] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-98 flex items-center gap-2"
                  >
                    <span>Calculate Transport Rates</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('how-it-works')}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors"
                  >
                    View Carrier Standards
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl">
                  <span className="text-xl sm:text-2xl font-black text-[#9DF1C0]">1-2 Tons</span>
                  <h4 className="text-xs font-bold text-white mt-1">Mini Truck (Tata Ace)</h4>
                  <p className="text-[11px] text-[#C1C8C2] mt-0.5">₹1,850 avg / 140 km</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl">
                  <span className="text-xl sm:text-2xl font-black text-[#FFDF9E]">2-4 Tons</span>
                  <h4 className="text-xs font-bold text-white mt-1">LCV (Tata 407)</h4>
                  <p className="text-[11px] text-[#C1C8C2] mt-0.5">₹3,200 avg / 140 km</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl">
                  <span className="text-xl sm:text-2xl font-black text-white">5-10 Tons</span>
                  <h4 className="text-xs font-bold text-white mt-1">Heavy Multi-Axle</h4>
                  <p className="text-[11px] text-[#C1C8C2] mt-0.5">₹6,800 avg / 140 km</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl">
                  <span className="text-xl sm:text-2xl font-black text-[#9DF1C0]">Cold 2-4°C</span>
                  <h4 className="text-xs font-bold text-white mt-1">Reefer Container</h4>
                  <p className="text-[11px] text-[#C1C8C2] mt-0.5">₹5,400 avg / 140 km</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION STRIP */}
      <section className="py-12 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[#002517]">
            Ready to trade directly on AgriTech?
          </h2>
          <p className="text-xs sm:text-sm text-[#525B54] mt-2 mb-6">
            Join thousands of progressive Indian farmers and commercial buyers getting transparent market prices every single day.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuthModal('farmer', 'register')}
              className="bg-[#002517] hover:bg-[#123B2A] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-98 flex items-center gap-2"
            >
              <Sprout className="w-4 h-4 text-[#9DF1C0]" />
              <span>Register as Farmer</span>
            </button>

            <button
              onClick={() => onOpenAuthModal('buyer', 'register')}
              className="bg-[#E6F0E8] hover:bg-[#D7E4DA] text-[#002517] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#0D6C45]" />
              <span>Register as Buyer</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
