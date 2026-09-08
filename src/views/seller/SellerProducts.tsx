import React, { useState } from 'react';
import { ProductListing } from '../../types';
import { useAuth } from '../../auth/useAuth';
import {
  ArrowLeft,
  PlusCircle,
  Search,
  Trash2,
  Eye,
  PauseCircle,
  PlayCircle,
  MapPin,
  Store,
  Package
} from 'lucide-react';

interface SellerProductsProps {
  products: ProductListing[];
  onNavigate: (view: string, extra?: any) => void;
  onToggleStatus: (id: string) => void;
  onDeleteProduct: (id: string) => void;
}

export const SellerProducts: React.FC<SellerProductsProps> = ({
  products,
  onNavigate,
  onToggleStatus,
  onDeleteProduct,
}) => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Seller-specific products
  const sellerProducts = products.filter(p => p.farmerId === user?.id);

  const filteredProducts = sellerProducts.filter((prod) => {
    const statusMatch = filterStatus === 'All' || prod.status === filterStatus;
    const queryMatch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       prod.cropName.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && queryMatch;
  });

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Top Header */}
      <div className="bg-[#002517] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => onNavigate('seller-dashboard')}
              className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:underline mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Seller Dashboard</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Seller Produce Inventory</h1>
            <p className="text-xs sm:text-sm text-[#C1C8C2] mt-0.5">
              Manage your commercial crop lots, availability, pricing, and wholesale status
            </p>
          </div>

          <button
            onClick={() => onNavigate('seller-products-new')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>List New Produce Batch</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Search & Filter Controls */}
        <div className="bg-white border border-[#E7DDC8] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              placeholder="Search by produce title or crop name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F7F5EF] border border-[#C1C8C2]/60 rounded-xl pl-10 pr-4 py-2 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Active', 'Paused', 'Sold Out', 'Draft'].map((status) => (
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

        {/* Listings Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-[#E7DDC8] rounded-3xl p-12 text-center">
            <Package className="w-12 h-12 text-[#C1C8C2] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#002517]">No produce listings found</h3>
            <p className="text-xs text-[#717973] mt-1 max-w-md mx-auto">
              {sellerProducts.length === 0
                ? 'You have not created any produce listings yet. Click List New Produce Batch to get started.'
                : 'No listings match your current search and status filter criteria.'}
            </p>
            {sellerProducts.length === 0 && (
              <button
                onClick={() => onNavigate('seller-products-new')}
                className="mt-5 inline-flex items-center gap-2 bg-[#002517] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#9DF1C0]" />
                <span>Create First Listing</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-[#E7DDC8] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-[#E6F0E8] overflow-hidden">
                    <img
                      src={prod.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#002517]/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      {prod.category}
                    </div>
                    <div className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                      prod.status === 'Active'
                        ? 'bg-emerald-600 text-white'
                        : prod.status === 'Paused'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700 text-white'
                    }`}>
                      {prod.status}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-base text-[#002517] leading-snug">{prod.title}</h3>
                    <p className="text-xs text-[#717973] mt-0.5">Crop: {prod.cropName} • Variety: {prod.variety || 'Standard'}</p>

                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-black text-[#002517]">₹{prod.pricePerUnit}</span>
                        <span className="text-xs text-[#717973]"> / {prod.unit}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {prod.grade}
                      </span>
                    </div>

                    <div className="mt-3 py-2 border-t border-b border-[#E7DDC8] flex items-center justify-between text-xs text-[#525B54]">
                      <span>Stock Available:</span>
                      <strong className="text-[#002517]">{prod.quantityAvailable} {prod.unit}</strong>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#717973]">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{prod.district}, {prod.state}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#F7F5EF] border-t border-[#E7DDC8] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigate('product-details', { product: prod })}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-bold text-[#002517] bg-white border border-[#E7DDC8] py-2 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => onToggleStatus(prod.id)}
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-[#E7DDC8] text-[#525B54] hover:bg-slate-50 cursor-pointer"
                    title={prod.status === 'Active' ? 'Pause Listing' : 'Activate Listing'}
                  >
                    {prod.status === 'Active' ? (
                      <PauseCircle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <PlayCircle className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteProduct(prod.id)}
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-[#E7DDC8] text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
