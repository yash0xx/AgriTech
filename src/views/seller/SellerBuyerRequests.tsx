import React, { useState } from 'react';
import { BuyerRequest } from '../../types';
import { useAuth } from '../../auth/useAuth';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  MessageSquare,
  DollarSign
} from 'lucide-react';

interface SellerBuyerRequestsProps {
  buyerRequests: BuyerRequest[];
  onNavigate: (view: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onCounterOfferRequest: (request: BuyerRequest, counterPrice: number, counterNote?: string) => void;
}

export const SellerBuyerRequests: React.FC<SellerBuyerRequestsProps> = ({
  buyerRequests,
  onNavigate,
  onAcceptRequest,
  onDeclineRequest,
  onCounterOfferRequest,
}) => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [counterModalRequest, setCounterModalRequest] = useState<BuyerRequest | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterNote, setCounterNote] = useState<string>('');

  // Filter requests targeting seller's listings
  const sellerRequests = buyerRequests.filter(r => r.farmerId === user?.id || !r.farmerId);

  const filteredRequests = sellerRequests.filter((req) => {
    const statusMatch = filterStatus === 'All' || req.status === filterStatus;
    const queryMatch = req.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       req.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && queryMatch;
  });

  const handleOpenCounter = (req: BuyerRequest) => {
    setCounterModalRequest(req);
    setCounterPrice(req.offeredPrice);
    setCounterNote('');
  };

  const handleSendCounter = () => {
    if (counterModalRequest && counterPrice > 0) {
      onCounterOfferRequest(counterModalRequest, counterPrice, counterNote);
      setCounterModalRequest(null);
    }
  };

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
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Wholesale Buyer Purchase Requests</h1>
          <p className="text-xs sm:text-sm text-[#C1C8C2] mt-0.5">
            Review incoming purchase offers, negotiate pricing, and accept commercial purchase orders
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Filters */}
        <div className="bg-white border border-[#E7DDC8] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              placeholder="Search by produce or buyer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F7F5EF] border border-[#C1C8C2]/60 rounded-xl pl-10 pr-4 py-2 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Pending', 'Accepted', 'Declined', 'Countered'].map((status) => (
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

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-[#E7DDC8] rounded-3xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-[#C1C8C2] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#002517]">No purchase requests found</h3>
            <p className="text-xs text-[#717973] mt-1 max-w-md mx-auto">
              When wholesale buyers submit quotation requests or price offers for your produce, they will be listed here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-[#E7DDC8] rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-[#002517]">{req.cropName}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      req.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : req.status === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'Declined'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-[#525B54] flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Buyer: <strong className="text-[#002517]">{req.buyerName}</strong></span>
                    <span>•</span>
                    <span>Quantity Demanded: <strong className="text-[#002517]">{req.quantity} {req.unit}</strong></span>
                    <span>•</span>
                    <span>Offered Rate: <strong className="text-emerald-700">₹{req.offeredPrice} / {req.unit}</strong></span>
                    <span>•</span>
                    <span>Total Target: <strong className="text-[#002517]">₹{(req.offeredPrice * req.quantity).toLocaleString('en-IN')}</strong></span>
                  </div>

                  {req.message && (
                    <p className="text-xs text-[#717973] bg-[#F7F5EF] p-3 rounded-xl border border-[#E7DDC8]">
                      "{req.message}"
                    </p>
                  )}
                </div>

                {req.status === 'Pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onAcceptRequest(req.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Order</span>
                    </button>
                    <button
                      onClick={() => handleOpenCounter(req)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Counter Offer</span>
                    </button>
                    <button
                      onClick={() => onDeclineRequest(req.id)}
                      className="px-4 py-2 bg-white border border-[#E7DDC8] text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Counter Offer Modal */}
      {counterModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E7DDC8] shadow-2xl">
            <h3 className="text-base font-bold text-[#002517] mb-2">Send Counter Offer</h3>
            <p className="text-xs text-[#717973] mb-4">
              Countering proposal for <strong>{counterModalRequest.cropName}</strong> ({counterModalRequest.quantity} {counterModalRequest.unit}) from {counterModalRequest.buyerName}.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase mb-1">
                  Proposed Counter Rate (₹ per {counterModalRequest.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase mb-1">
                  Negotiation Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="e.g. Best price including primary sorting and gunny packaging..."
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl p-3 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setCounterModalRequest(null)}
                  className="px-4 py-2 bg-slate-100 text-xs font-bold text-[#525B54] rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendCounter}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Submit Counter Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
