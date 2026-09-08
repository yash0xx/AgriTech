import React, { useState } from 'react';
import { OrderItem } from '../../types';
import { useAuth } from '../../auth/useAuth';
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShoppingBag
} from 'lucide-react';

interface SellerOrdersProps {
  orders: OrderItem[];
  onNavigate: (view: string) => void;
  onUpdateOrderStatus: (orderId: string, status: any) => void;
}

export const SellerOrders: React.FC<SellerOrdersProps> = ({
  orders,
  onNavigate,
  onUpdateOrderStatus,
}) => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Seller-specific orders (where seller is the listing owner)
  const sellerOrders = orders.filter(o => o.farmerId === user?.id || !o.farmerId);

  const filteredOrders = sellerOrders.filter((o) => {
    const statusMatch = filterStatus === 'All' || o.status === filterStatus;
    const queryMatch = o.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       o.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && queryMatch;
  });

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Header */}
      <div className="bg-[#002517] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate('seller-dashboard')}
            className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:underline mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Seller Dashboard</span>
          </button>
          <h1 className="text-xl sm:text-3xl font-black text-white">Commercial Orders & Escrow Settlements</h1>
          <p className="text-xs text-[#C1C8C2] mt-0.5">
            Manage commercial order fulfillment, dispatches, and milestone-based escrow payouts
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-3xl border border-[#E7DDC8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              placeholder="Search by order #, crop, or buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F7F5EF] border border-[#C1C8C2]/60 rounded-xl pl-10 pr-4 py-2 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'Placed', 'Confirmed', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#002517] text-white'
                    : 'bg-[#F7F5EF] text-[#525B54] hover:bg-[#E6F0E8]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table / Cards */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-[#E7DDC8] rounded-3xl p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-[#C1C8C2] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#002517]">No commercial orders found</h3>
            <p className="text-xs text-[#717973] mt-1 max-w-md mx-auto">
              {sellerOrders.length === 0
                ? 'When wholesale buyers accept terms and fund orders via escrow, they will appear here.'
                : 'No orders match your filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E7DDC8] rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#002517] bg-[#F7F5EF] px-2.5 py-1 rounded-lg border border-[#E7DDC8]">
                      {order.orderNumber}
                    </span>
                    <span className="text-sm font-bold text-[#002517]">{order.cropName}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#525B54]">
                    <div>
                      <span className="text-[#717973] block text-[10px] uppercase">Buyer</span>
                      <strong className="text-[#002517]">{order.buyerName}</strong>
                    </div>
                    <div>
                      <span className="text-[#717973] block text-[10px] uppercase">Volume</span>
                      <strong className="text-[#002517]">{order.quantity} {order.unit}</strong>
                    </div>
                    <div>
                      <span className="text-[#717973] block text-[10px] uppercase">Amount</span>
                      <strong className="text-emerald-700 font-black">₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-[#717973] block text-[10px] uppercase">Escrow Safety</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#0D6C45] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{order.escrowStatus || 'Held in Escrow'}</span>
                      </span>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="flex items-center gap-1.5 text-xs text-[#717973]">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Delivery: {order.deliveryAddress}, {order.deliveryDistrict}</span>
                    </div>
                  )}
                </div>

                {/* Fulfillment Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {order.status === 'Placed' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'Confirmed')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === 'Confirmed' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'Dispatched')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch Produce</span>
                    </button>
                  )}
                  {order.status === 'Dispatched' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'In Transit')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mark In Transit</span>
                    </button>
                  )}
                  {order.status === 'In Transit' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'Delivered')}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Delivery</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
