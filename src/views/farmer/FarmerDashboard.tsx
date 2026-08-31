import React, { useState } from 'react';
import { ProductListing, BuyerRequest, OrderItem, MandiMarketPrice, UserRole } from '../../types';
import { AIInsightCard } from '../../components/common/AIInsightCard';
import { 
  Sprout, 
  PlusCircle, 
  ShoppingBag, 
  TrendingUp, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  ArrowRight, 
  ArrowUpRight, 
  DollarSign, 
  Package, 
  Eye, 
  BadgeCheck, 
  MessageSquare,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface FarmerDashboardProps {
  products: ProductListing[];
  buyerRequests: BuyerRequest[];
  orders: OrderItem[];
  marketPrices: MandiMarketPrice[];
  onNavigate: (view: string, extra?: any) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onCounterOfferRequest: (request: BuyerRequest) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  products,
  buyerRequests,
  orders,
  marketPrices,
  onNavigate,
  onAcceptRequest,
  onDeclineRequest,
  onCounterOfferRequest,
}) => {
  const farmerProducts = products.filter(p => p.farmerId === 'farmer-1');
  const activeProducts = products.filter(p => p.status === 'Active');
  const pendingRequests = buyerRequests.filter(r => r.status === 'Pending');

  // Revenue calculation
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const totalRevenue = 124500;

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Header Profile Bar */}
      <div className="bg-[#002517] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
                alt="Rajesh Patil"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#9DF1C0]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">Good morning, Rajesh Patil</h1>
                  <span className="flex items-center gap-1 bg-[#E6F0E8] text-[#002517] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5 text-[#0D6C45]" />
                    <span>KYC Verified Farmer</span>
                  </span>
                </div>
                <p className="text-xs text-[#C1C8C2] mt-0.5">
                  Nashik Belt • 12.5 Acres Trellis & Greenhouse Farm • APMC Linked
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('farmer-add-crop')}
                className="bg-[#9DF1C0] hover:bg-[#86E4AD] text-[#002517] font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-98"
              >
                <PlusCircle className="w-4 h-4 text-[#002517]" />
                <span>Post New Crop Listing</span>
              </button>

              <button
                onClick={() => onNavigate('logistics')}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4 text-[#9DF1C0]" />
                <span>Book Transport</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Contextual AI Insight Banner */}
        <AIInsightCard
          variant="banner"
          title="Optimal Selling Window Detected"
          insight="Tomato prices at Pune Mandi increased by +8.4% today due to lower arrivals. We recommend listing remaining 500kg stock at ₹25-₹27/kg for swift direct purchase."
          actionLabel="List Remaining Stock"
          onAction={() => onNavigate('farmer-add-crop')}
        />

        {/* 4 KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Total Escrow Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              ₹1,24,500
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.5% this month</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Active Listings
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              {products.length}
            </div>
            <span className="text-[11px] text-[#717973] block">
              3,000 kg produce online
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Pending Buyer Requests
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#0D6C45]">
              {pendingRequests.length}
            </div>
            <button 
              onClick={() => onNavigate('farmer-buyer-requests')}
              className="text-[11px] font-bold text-[#0D6C45] hover:underline block"
            >
              Review new offers →
            </button>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Completed Orders
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              18
            </div>
            <span className="text-[11px] text-[#717973] block">
              4.8 ★ rating (42 reviews)
            </span>
          </div>
        </div>

        {/* 2-Column Split: Buyer Requests & Active Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: PENDING BUYER OFFERS / REQUESTS */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E7DDC8] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#002517]">Recent Buyer Purchase Offers</h3>
                  <p className="text-xs text-[#717973]">Wholesalers requesting your harvest stock</p>
                </div>
                <button
                  onClick={() => onNavigate('farmer-buyer-requests')}
                  className="text-xs font-bold text-[#0D6C45] hover:underline"
                >
                  View All ({buyerRequests.length})
                </button>
              </div>

              <div className="divide-y divide-[#E7DDC8]">
                {buyerRequests.map((req) => (
                  <div key={req.id} className="p-5 hover:bg-[#F7F5EF]/50 transition-colors space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.buyerAvatar}
                          alt={req.buyerName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#002517]">{req.buyerName}</h4>
                          <span className="text-[11px] text-[#717973]">{req.buyerLocation} • {req.buyerType}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F7F5EF] rounded-2xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#717973]">Requested Produce:</span>
                        <span className="font-bold text-[#002517]">{req.cropName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#717973]">Quantity:</span>
                        <span className="font-bold text-[#002517]">{req.requestedQuantity} {req.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#717973]">Offered Rate:</span>
                        <span className="font-black text-[#0D6C45]">₹{req.offeredPrice}/{req.unit} (Total ₹{req.totalOfferedValue.toLocaleString('en-IN')})</span>
                      </div>
                      {req.message && (
                        <p className="text-[11px] text-[#525B54] pt-1 border-t border-[#E7DDC8] italic">
                          "{req.message}"
                        </p>
                      )}
                    </div>

                    {req.status === 'Pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onAcceptRequest(req.id)}
                          className="flex-1 bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#9DF1C0]" />
                          <span>Accept Offer</span>
                        </button>

                        <button
                          onClick={() => onCounterOfferRequest(req)}
                          className="bg-[#E6F0E8] hover:bg-[#D7E4DA] text-[#002517] font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1"
                        >
                          <Scale className="w-3.5 h-3.5 text-[#0D6C45]" />
                          <span>Counter</span>
                        </button>

                        <button
                          onClick={() => onDeclineRequest(req.id)}
                          className="p-2 text-[#717973] hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                          title="Decline"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: ACTIVE LISTINGS & MANDI RATES */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Active Listings Mini Table */}
            <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E7DDC8] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#002517]">My Crop Listings</h3>
                  <span className="text-xs text-[#717973]">{products.length} published products</span>
                </div>
                <button
                  onClick={() => onNavigate('farmer-products')}
                  className="text-xs font-bold text-[#0D6C45] hover:underline"
                >
                  Manage All
                </button>
              </div>

              <div className="divide-y divide-[#E7DDC8]">
                {products.slice(0, 3).map((prod) => (
                  <div key={prod.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[#F7F5EF]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#002517] line-clamp-1">{prod.title}</h4>
                        <span className="text-[11px] text-[#717973]">{prod.quantityAvailable} {prod.unit} left</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-[#002517]">₹{prod.pricePerUnit}/{prod.unit}</div>
                      <span className="text-[10px] font-bold text-[#0D6C45] bg-[#E6F0E8] px-2 py-0.5 rounded-full">
                        {prod.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#F7F5EF] text-center border-t border-[#E7DDC8]">
                <button
                  onClick={() => onNavigate('farmer-add-crop')}
                  className="text-xs font-bold text-[#002517] hover:text-[#0D6C45] inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#0D6C45]" />
                  <span>Add another harvest batch</span>
                </button>
              </div>
            </div>

            {/* Quick Mandi Rates Widget */}
            <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#002517] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#0D6C45]" />
                  <span>Nashik & Pune APMC Rates</span>
                </h3>
                <span className="text-[10px] font-bold text-[#0D6C45] bg-[#E6F0E8] px-2 py-0.5 rounded-full">Live</span>
              </div>

              <div className="space-y-2">
                {marketPrices.slice(0, 3).map((mp) => (
                  <div key={mp.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F5EF] text-xs">
                    <div>
                      <span className="font-bold text-[#002517]">{mp.cropName}</span>
                      <span className="text-[10px] text-[#717973] block">{mp.mandi}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-[#002517]">₹{mp.currentPrice}/kg</span>
                      <span className={`text-[10px] font-bold block ${mp.trend === 'up' ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {mp.trend === 'up' ? '+' : ''}{mp.changePercentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
