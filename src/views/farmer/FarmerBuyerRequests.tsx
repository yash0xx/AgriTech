import React, { useState } from 'react';
import { BuyerRequest } from '../../types';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  Search, 
  MapPin, 
  Building2, 
  Clock, 
  MessageSquare,
  DollarSign
} from 'lucide-react';

interface FarmerBuyerRequestsProps {
  buyerRequests: BuyerRequest[];
  onNavigate: (view: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onCounterOfferRequest: (request: BuyerRequest) => void;
}

export const FarmerBuyerRequests: React.FC<FarmerBuyerRequestsProps> = ({
  buyerRequests,
  onNavigate,
  onAcceptRequest,
  onDeclineRequest,
  onCounterOfferRequest,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = buyerRequests.filter((req) => {
    const statusMatch = filterStatus === 'All' || req.status === filterStatus;
    const queryMatch = req.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       req.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && queryMatch;
  });

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Top Header */}
      <div className="bg-[#002517] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate('farmer-dashboard')}
            className="inline-flex items-center gap-1 text-xs text-[#9DF1C0] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Farmer Dashboard</span>
          </button>
          <h1 className="text-xl sm:text-3xl font-black text-white">Buyer Purchase Requests & Offers</h1>
          <p className="text-xs text-[#C1C8C2] mt-0.5">Negotiate directly with commercial buyers and supermarkets.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Top Controls */}
        <div className="bg-white p-4 rounded-3xl border border-[#E7DDC8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop or buyer..."
              className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl pl-10 pr-4 py-2 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {['All', 'Pending', 'Accepted', 'Declined'].map((st) => (
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

        {/* Requests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.length === 0 ? (
            <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-[#E7DDC8]">
              <MessageSquare className="w-10 h-10 text-[#C1C8C2] mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-[#002517]">No buyer requests found</h3>
              <p className="text-xs text-[#717973] mt-0.5">Check back later or post new harvest listings to attract buyers.</p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.buyerAvatar}
                        alt={req.buyerName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-2xl object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-[#002517]">{req.buyerName}</h4>
                        <span className="text-xs text-[#717973]">{req.buyerCompany} • {req.buyerLocation}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      req.status === 'Pending'
                        ? 'bg-amber-100 text-amber-900'
                        : req.status === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="p-4 bg-[#F7F5EF] rounded-2xl text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#717973]">Crop:</span>
                      <span className="font-bold text-[#002517]">{req.cropName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#717973]">Requested Quantity:</span>
                      <span className="font-bold text-[#002517]">{req.requestedQuantity} {req.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#717973]">Offered Price:</span>
                      <span className="font-black text-[#0D6C45]">₹{req.offeredPrice}/{req.unit}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-[#E7DDC8] font-bold text-[#002517]">
                      <span>Total Value:</span>
                      <span>₹{req.totalOfferedValue.toLocaleString('en-IN')}</span>
                    </div>
                    {req.message && (
                      <p className="text-[11px] text-[#525B54] pt-1.5 border-t border-[#E7DDC8] italic">
                        "{req.message}"
                      </p>
                    )}
                  </div>
                </div>

                {req.status === 'Pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E7DDC8]">
                    <button
                      onClick={() => onAcceptRequest(req.id)}
                      className="flex-1 bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#9DF1C0]" />
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={() => onCounterOfferRequest(req)}
                      className="bg-[#E6F0E8] hover:bg-[#D7E4DA] text-[#002517] font-bold py-2.5 px-3 rounded-xl text-xs flex items-center gap-1"
                    >
                      <Scale className="w-3.5 h-3.5 text-[#0D6C45]" />
                      <span>Counter</span>
                    </button>

                    <button
                      onClick={() => onDeclineRequest(req.id)}
                      className="p-2.5 text-[#717973] hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                      title="Decline"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
