import React from 'react';
import { ProductListing, BuyerRequest, OrderItem, MandiMarketPrice } from '../../types';
import { AIInsightCard } from '../../components/common/AIInsightCard';
import { 
  ShoppingBag, 
  Store, 
  Truck, 
  ShieldCheck, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight, 
  Clock, 
  BadgeCheck, 
  CheckCircle2, 
  MapPin, 
  AlertCircle
} from 'lucide-react';

interface BuyerDashboardProps {
  products: ProductListing[];
  buyerRequests: BuyerRequest[];
  orders: OrderItem[];
  marketPrices: MandiMarketPrice[];
  onNavigate: (view: string, extra?: any) => void;
  onConfirmDelivery: (orderId: string) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  products,
  buyerRequests,
  orders,
  marketPrices,
  onNavigate,
  onConfirmDelivery,
}) => {
  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Header Bar */}
      <div className="bg-[#002517] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
              alt="Priya Shah"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FFDF9E]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">Priya Shah</h1>
                <span className="flex items-center gap-1 bg-[#FFF8E7] text-[#002517] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#C2962A]" />
                  <span>GSTIN Verified Buyer</span>
                </span>
              </div>
              <p className="text-xs text-[#C1C8C2] mt-0.5">
                FreshFarm Retail & Wholesale • Navi Mumbai Central Godown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('marketplace')}
              className="bg-[#9DF1C0] hover:bg-[#86E4AD] text-[#002517] font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-98"
            >
              <Store className="w-4 h-4 text-[#002517]" />
              <span>Browse Farm Gate Market</span>
            </button>

            <button
              onClick={() => onNavigate('logistics')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4 text-[#9DF1C0]" />
              <span>Logistics</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* AI Procurement Tip */}
        <AIInsightCard
          variant="banner"
          title="Procurement Window: Nashik Grapes"
          insight="Nashik Sonaka Seedless Grapes have entered peak seasonal harvest. Locking direct farm-gate orders today saves ~₹8.50/kg compared to Vashi APMC auction rates."
          actionLabel="View Grape Harvests"
          onAction={() => onNavigate('marketplace', { query: 'Grape' })}
        />

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Total Sourced Value
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              ₹1,85,200
            </div>
            <span className="text-[11px] text-emerald-700 font-bold block">
              12 direct farm orders
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Active in Escrow
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#0D6C45]">
              ₹37,500
            </div>
            <span className="text-[11px] text-[#717973] block">
              Funds protected till delivery
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Active Shipments
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              {activeOrders.length}
            </div>
            <span className="text-[11px] text-[#717973] block">
              GPS tracked in transit
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Sent Sourcing Offers
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              {buyerRequests.length}
            </div>
            <span className="text-[11px] text-[#717973] block">
              1 pending farmer review
            </span>
          </div>
        </div>

        {/* 2-Column Split: Active Orders & Sourcing Offers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: ACTIVE SHIPMENTS & ESCROW RELEASES */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E7DDC8] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#002517]">Active Procurement Orders</h3>
                  <p className="text-xs text-[#717973]">Inspect produce on arrival and release escrow payments</p>
                </div>
                <button
                  onClick={() => onNavigate('buyer-orders')}
                  className="text-xs font-bold text-[#0D6C45] hover:underline"
                >
                  All Orders ({orders.length})
                </button>
              </div>

              <div className="divide-y divide-[#E7DDC8]">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-5 hover:bg-[#F7F5EF]/50 transition-colors space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-mono text-[#717973] block">{ord.orderNumber}</span>
                        <h4 className="text-sm font-bold text-[#002517]">{ord.cropName}</h4>
                        <span className="text-xs text-[#525B54]">Farmer: {ord.farmerName}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-[#002517] block">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F7F5EF] rounded-2xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#717973]">Quantity & Rate:</span>
                        <span className="font-semibold text-[#002517]">{ord.quantity} {ord.unit} @ ₹{ord.pricePerUnit}/{ord.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#717973]">Delivery Destination:</span>
                        <span className="font-semibold text-[#002517]">{ord.deliveryLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#717973]">Escrow Vault:</span>
                        <span className="font-bold text-[#0D6C45] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {ord.escrowStatus === 'Held' ? 'Funds Safely Held' : 'Released to Farmer'}
                        </span>
                      </div>
                    </div>

                    {ord.status !== 'Delivered' && (
                      <div className="pt-1">
                        <button
                          onClick={() => onConfirmDelivery(ord.id)}
                          className="w-full bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#9DF1C0]" />
                          <span>Confirm Quality & Release Escrow Payment</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: SENT SOURCING OFFERS & RECOMMENDED CROPS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Sent Sourcing Offers */}
            <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E7DDC8] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#002517]">My Custom Offers</h3>
                  <span className="text-xs text-[#717973]">{buyerRequests.length} active negotiations</span>
                </div>
              </div>

              <div className="divide-y divide-[#E7DDC8]">
                {buyerRequests.map((req) => (
                  <div key={req.id} className="p-4 space-y-2 hover:bg-[#F7F5EF]/50 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#002517]">{req.cropName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#525B54]">
                      <span>{req.requestedQuantity} {req.unit} @ ₹{req.offeredPrice}/{req.unit}</span>
                      <span className="font-black text-[#002517]">₹{req.totalOfferedValue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Farm Batches */}
            <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#002517]">
                  Fresh Farm Batches Today
                </h3>
                <button onClick={() => onNavigate('marketplace')} className="text-xs font-bold text-[#0D6C45] hover:underline">
                  View Market
                </button>
              </div>

              <div className="space-y-2">
                {products.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => onNavigate('product-details', { product: prod })}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F7F5EF] hover:bg-[#E6F0E8] cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={prod.images[0]} alt={prod.title} referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-[#002517] line-clamp-1">{prod.title}</span>
                        <span className="text-[10px] text-[#717973]">{prod.district} • {prod.farmer.name}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-[#002517]">₹{prod.pricePerUnit}/{prod.unit}</span>
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
