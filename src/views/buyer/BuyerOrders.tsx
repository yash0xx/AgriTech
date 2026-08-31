import React, { useState } from 'react';
import { OrderItem } from '../../types';
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Download,
  Calendar,
  Store,
  Star
} from 'lucide-react';

interface BuyerOrdersProps {
  orders: OrderItem[];
  onNavigate: (view: string) => void;
  onConfirmDelivery: (orderId: string) => void;
}

export const BuyerOrders: React.FC<BuyerOrdersProps> = ({
  orders,
  onNavigate,
  onConfirmDelivery,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((o) => {
    const statusMatch = filterStatus === 'All' || o.status === filterStatus;
    const queryMatch = o.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       o.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && queryMatch;
  });

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Header */}
      <div className="bg-[#002517] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => onNavigate('buyer-dashboard')}
              className="inline-flex items-center gap-1 text-xs text-[#9DF1C0] hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Buyer Dashboard</span>
            </button>
            <h1 className="text-xl sm:text-3xl font-black text-white">My Sourcing Orders</h1>
            <p className="text-xs text-[#C1C8C2] mt-0.5">Manage produce deliveries, weighbridge receipts, and escrow payouts.</p>
          </div>

          <button
            onClick={() => onNavigate('marketplace')}
            className="bg-[#9DF1C0] hover:bg-[#86E4AD] text-[#002517] font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-98 self-start sm:self-auto"
          >
            <Store className="w-4 h-4 text-[#002517]" />
            <span>Place New Order</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Controls */}
        <div className="bg-white p-4 rounded-3xl border border-[#E7DDC8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop, Order # or farmer..."
              className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl pl-10 pr-4 py-2 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {['All', 'Confirmed', 'Dispatched', 'Delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  filterStatus === st ? 'bg-[#002517] text-white' : 'bg-[#F7F5EF] text-[#525B54] hover:bg-[#E6F0E8]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F5EF] border-b border-[#E7DDC8] text-[11px] font-bold text-[#717973] uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Order ID & Crop</th>
                  <th className="py-3 px-4">Farmer / Origin</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Escrow Status</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DDC8] text-xs">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F7F5EF]/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-bold text-[#002517] block">{ord.cropName}</span>
                      <span className="text-[11px] text-[#717973] font-mono">{ord.orderNumber} • {ord.createdAt}</span>
                    </td>

                    <td className="py-4 px-4 text-[#525B54]">
                      <span className="font-semibold text-[#002517] block">{ord.farmerName}</span>
                      <span className="text-[11px] text-[#717973]">{ord.deliveryLocation}</span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-[#002517]">
                      {ord.quantity} {ord.unit}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-black text-[#002517]">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-[#717973] block">₹{ord.pricePerUnit}/{ord.unit}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.escrowStatus === 'Held'
                          ? 'bg-amber-100 text-amber-900'
                          : ord.escrowStatus === 'Released'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        {ord.escrowStatus}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-900'
                          : ord.status === 'Dispatched'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      {ord.status !== 'Delivered' ? (
                        <button
                          onClick={() => onConfirmDelivery(ord.id)}
                          className="bg-[#002517] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl hover:bg-[#123B2A] whitespace-nowrap"
                        >
                          Approve Delivery
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold">✓ Delivered & Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
