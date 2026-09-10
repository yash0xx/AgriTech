import React from 'react';
import { ProductListing, BuyerRequest, OrderItem, MandiMarketPrice } from '../../types';
import { useAuth } from '../../auth/useAuth';
import {
  Store,
  PlusCircle,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Package,
  MessageSquare,
  Truck,
  Building
} from 'lucide-react';

interface SellerDashboardProps {
  products: ProductListing[];
  buyerRequests: BuyerRequest[];
  orders: OrderItem[];
  marketPrices: MandiMarketPrice[];
  onNavigate: (view: string, extra?: any) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onCounterOfferRequest: (request: BuyerRequest) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  products,
  buyerRequests,
  orders,
  marketPrices,
  onNavigate,
  onAcceptRequest,
  onDeclineRequest,
  onCounterOfferRequest,
}) => {
  const { user, profile } = useAuth();
  const currentSellerId = user?.id;

  // Filter owned listings, requests, and orders
  const sellerProducts = products.filter(p => p.farmerId === currentSellerId);
  const activeListings = sellerProducts.filter(p => p.status === 'Active');
  const pendingRequests = buyerRequests.filter(r => r.farmerId === currentSellerId && r.status === 'Pending');
  const sellerOrders = orders.filter(o => o.farmerId === currentSellerId);
  const deliveredOrders = sellerOrders.filter(o => o.status === 'Delivered');
  const activeDispatches = sellerOrders.filter(o => ['Confirmed', 'Dispatched', 'In Transit'].includes(o.status));

  const totalSalesRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Header Seller Bar */}
      <div className="bg-[#002517] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-900/40 border border-indigo-400/40 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
              <Store className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{profile?.fullName || 'Seller Portal'}</h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/30">
                  Verified Merchant / Seller
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#C1C8C2] mt-1 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>Agricultural Trade & Produce Aggregation Desk</span>
                <span>•</span>
                <span>Role: SELLER</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('seller-products-new')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>List Produce Batch</span>
            </button>
            <button
              onClick={() => onNavigate('seller-products')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-white/10 cursor-pointer"
            >
              <span>Manage Inventory ({sellerProducts.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-[#E7DDC8] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#717973] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Listings</span>
              <Package className="w-4 h-4 text-[#0D6C45]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              {activeListings.length}
            </div>
            <div className="text-[11px] text-[#717973] mt-1">
              {sellerProducts.length} total registered lots
            </div>
          </div>

          <div className="bg-white border border-[#E7DDC8] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#717973] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Buyer RFQs</span>
              <MessageSquare className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              {pendingRequests.length}
            </div>
            <div className="text-[11px] text-[#717973] mt-1">
              Offers awaiting counter/acceptance
            </div>
          </div>

          <div className="bg-white border border-[#E7DDC8] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#717973] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Dispatches</span>
              <Truck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              {activeDispatches.length}
            </div>
            <div className="text-[11px] text-[#717973] mt-1">
              Orders in transit or confirmed
            </div>
          </div>

          <div className="bg-white border border-[#E7DDC8] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#717973] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Completed Orders</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              {deliveredOrders.length}
            </div>
            <div className="text-[11px] text-[#717973] mt-1">
              Settled escrow payouts
            </div>
          </div>
        </div>

        {/* Main Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Buyer Requests & My Listings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Incoming Buyer Requests */}
            <div className="bg-white border border-[#E7DDC8] rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E7DDC8]">
                <div>
                  <h2 className="text-lg font-bold text-[#002517] tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    <span>Incoming Buyer Purchase Requests</span>
                  </h2>
                  <p className="text-xs text-[#717973] mt-0.5">
                    Offers submitted by verified commercial buyers on your produce listings
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('seller-requests')}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({buyerRequests.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-10 text-[#717973]">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-[#C1C8C2]" />
                  <p className="text-sm font-semibold">No pending requests at this moment.</p>
                  <p className="text-xs text-[#717973] mt-1">New requests from prospective wholesale buyers will appear here in real time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.slice(0, 3).map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#002517]">{req.cropName}</span>
                          <span className="text-xs bg-white px-2 py-0.5 rounded-md border border-[#E7DDC8] text-[#525B54]">
                            {req.quantity} {req.unit}
                          </span>
                        </div>
                        <div className="text-xs text-[#717973] mt-1">
                          Buyer: <strong className="text-[#002517]">{req.buyerName}</strong> • Offer:{' '}
                          <strong className="text-emerald-700 font-semibold">₹{req.offeredPrice}/{req.unit}</strong>
                          {' '}(Target Total: ₹{(req.offeredPrice * req.quantity).toLocaleString('en-IN')})
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onAcceptRequest(req.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => onCounterOfferRequest(req)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>Counter</span>
                        </button>
                        <button
                          onClick={() => onDeclineRequest(req.id)}
                          className="px-3 py-1.5 bg-white border border-[#E7DDC8] text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Owned Produce Listings */}
            <div className="bg-white border border-[#E7DDC8] rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E7DDC8]">
                <div>
                  <h2 className="text-lg font-bold text-[#002517] tracking-tight flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#0D6C45]" />
                    <span>My Produce Catalog</span>
                  </h2>
                  <p className="text-xs text-[#717973] mt-0.5">
                    Your active marketplace product batches and stock levels
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('seller-products')}
                  className="text-xs font-bold text-[#0D6C45] hover:text-[#002517] flex items-center gap-1 cursor-pointer"
                >
                  <span>All Batches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {sellerProducts.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="w-10 h-10 text-[#C1C8C2] mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-[#002517]">No active listings found</h3>
                  <p className="text-xs text-[#717973] mt-1 max-w-sm mx-auto">
                    Publish your first agricultural batch to begin receiving purchase requests from commercial buyers.
                  </p>
                  <button
                    onClick={() => onNavigate('seller-products-new')}
                    className="mt-4 inline-flex items-center gap-1.5 bg-[#002517] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#9DF1C0]" />
                    <span>List First Crop</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sellerProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-[#002517]">{product.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            product.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#525B54]">
                          Category: <strong>{product.category}</strong> • Grade: <strong>{product.grade}</strong>
                        </p>
                        <div className="mt-2 text-sm font-black text-[#002517]">
                          ₹{product.pricePerUnit} / {product.unit}
                        </div>
                        <div className="text-[11px] text-[#717973] mt-0.5">
                          Available: {product.quantityAvailable} {product.unit}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#E7DDC8] flex items-center justify-between text-xs">
                        <span className="text-[#717973]">{product.district}, {product.state}</span>
                        <button
                          onClick={() => onNavigate('seller-products')}
                          className="font-bold text-indigo-700 hover:underline cursor-pointer"
                        >
                          Manage →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Mandi Intelligence & Recent Orders */}
          <div className="space-y-8">
            {/* Live APMC Mandi Feeds */}
            <div className="bg-white border border-[#E7DDC8] rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#002517] uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0D6C45]" />
                  <span>APMC Market Rates</span>
                </h2>
                <button
                  onClick={() => onNavigate('market-prices')}
                  className="text-xs font-bold text-[#0D6C45] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-[#E7DDC8]">
                {marketPrices.slice(0, 5).map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#002517]">{m.cropName}</div>
                      <div className="text-[11px] text-[#717973]">{m.mandiName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-[#002517]">₹{m.modalPrice}/q</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        ₹{m.minPrice} - ₹{m.maxPrice}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#002517] text-white rounded-3xl p-6 shadow-lg">
              <h3 className="font-bold text-base mb-2">Seller Actions</h3>
              <p className="text-xs text-[#C1C8C2] mb-4">
                Manage your commercial supply-chain, negotiate with buyers, and track logistics dispatches.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('seller-orders')}
                  className="w-full text-left bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#9DF1C0]" />
                    <span>Seller Orders ({sellerOrders.length})</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C1C8C2]" />
                </button>
                <button
                  onClick={() => onNavigate('logistics')}
                  className="w-full text-left bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#FFDF9E]" />
                    <span>Book Farm-Gate Transport</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C1C8C2]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
