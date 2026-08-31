import React, { useState } from 'react';
import { MandiMarketPrice, CropCategory } from '../../types';
import { AIInsightCard } from '../../components/common/AIInsightCard';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  MapPin, 
  Sparkles, 
  RefreshCw, 
  Filter, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  Building2,
  HelpCircle
} from 'lucide-react';

interface MarketPricesPageProps {
  marketPrices: MandiMarketPrice[];
  onNavigate: (view: string, extra?: any) => void;
}

export const MarketPricesPage: React.FC<MarketPricesPageProps> = ({
  marketPrices,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [lastRefreshed, setLastRefreshed] = useState('Just now');

  const categories = ['All', 'Vegetables', 'Grains', 'Fruits', 'Spices', 'Oilseeds', 'Cash Crops'];
  const districts = ['All', 'Pune', 'Nashik', 'Navi Mumbai', 'Ahmednagar', 'Sangli'];

  const filteredPrices = marketPrices.filter((mp) => {
    const queryMatch = 
      mp.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mp.mandi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mp.district.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryMatch = selectedCategory === 'All' || mp.category === selectedCategory;
    const districtMatch = selectedDistrict === 'All' || mp.district.toLowerCase().includes(selectedDistrict.toLowerCase());

    return queryMatch && categoryMatch && districtMatch;
  });

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-20">
      
      {/* Header Banner */}
      <div className="bg-[#002517] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9DF1C0] mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Live APMC Market Intelligence Feed</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Live Mandi Prices & Trends
              </h1>
              <p className="text-xs sm:text-sm text-[#C1C8C2] mt-1 max-w-xl">
                Daily real-time benchmark rates across primary Maharashtra wholesale APMC mandis.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-2 rounded-2xl shrink-0 self-start md:self-auto text-xs">
              <span className="w-2 h-2 rounded-full bg-[#9DF1C0] animate-pulse" />
              <span className="text-white/90">Feed Status: Connected (APMC Live)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* AI Insight Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIInsightCard
            variant="banner"
            title="Tomato Price Escalation"
            insight="Tomato rates at Pune APMC Yard spiked +8.3% this morning due to delayed transport arrivals from southern borders. Direct farm gate listings are selling fast."
            actionLabel="Explore Tomatoes in Market"
            onAction={() => onNavigate('marketplace', { query: 'Tomato' })}
          />

          <AIInsightCard
            variant="banner"
            title="Lasalgaon Onion Benchmark"
            insight="Export orders to neighboring states have kept Lasalgaon Red Onion prices buoyant at ₹38/kg (+5.5%). Steady high demand expected through next week."
            actionLabel="Browse Onions"
            onAction={() => onNavigate('marketplace', { query: 'Onion' })}
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by crop name or mandi yard (e.g. Onion, Lasalgaon)..."
                className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
              />
            </div>

            {/* District Selector */}
            <div className="sm:col-span-3">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3 py-2 text-xs font-bold text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d === 'All' ? 'All Mandi Districts' : d}</option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3 py-2 text-xs font-bold text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Crop Categories' : c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mandi Rates Table */}
        <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E7DDC8] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#002517]">
              Real-time APMC Mandi Rates ({filteredPrices.length} tracked commodities)
            </h3>
            <span className="text-xs text-[#717973]">
              Prices in ₹ per kg / quintal
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F5EF] border-b border-[#E7DDC8] text-[11px] font-bold text-[#717973] uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Commodity / Crop</th>
                  <th className="py-3 px-4">Mandi Market</th>
                  <th className="py-3 px-4">Current Rate</th>
                  <th className="py-3 px-4">24h Trend</th>
                  <th className="py-3 px-4">7-Day Avg</th>
                  <th className="py-3 px-4">30-Day Avg</th>
                  <th className="py-3 px-4">Arrival Volume</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DDC8] text-xs">
                {filteredPrices.map((item) => {
                  const isUp = item.trend === 'up';
                  return (
                    <tr key={item.id} className="hover:bg-[#F2FCF3]/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-[#002517]">
                        <div className="flex items-center gap-2">
                          <span>{item.cropName}</span>
                          <span className="text-[10px] font-semibold text-[#0D6C45] bg-[#E6F0E8] px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-[#525B54]">
                        <div className="font-semibold text-[#002517]">{item.mandi}</div>
                        <div className="text-[11px] text-[#717973]">{item.district}, {item.state}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-sm font-black text-[#002517]">
                          ₹{item.currentPrice}
                        </span>
                        <span className="text-[10px] text-[#717973] ml-0.5">{item.unit.replace('₹', '')}</span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${
                          isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isUp ? '+' : ''}{item.changePercentage}%
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-[#525B54]">
                        ₹{item.sevenDayAvg}
                      </td>

                      <td className="py-4 px-4 font-semibold text-[#525B54]">
                        ₹{item.thirtyDayAvg}
                      </td>

                      <td className="py-4 px-4 text-[#525B54]">
                        {item.arrivalQuantityQuintals.toLocaleString('en-IN')} Quintals
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => onNavigate('marketplace', { query: item.cropName.split(' ')[0] })}
                          className="inline-flex items-center gap-1 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs"
                        >
                          <span>Trade Crop</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Note */}
        <div className="p-4 bg-white rounded-2xl border border-[#E7DDC8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#525B54]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0D6C45] shrink-0" />
            <span>Mandi rates are directly indexed from official Agricultural Produce Market Committee (APMC) electronic feeds.</span>
          </div>
          <span className="text-[11px] text-[#717973] shrink-0">Updated every 15 minutes</span>
        </div>
      </div>
    </div>
  );
};
