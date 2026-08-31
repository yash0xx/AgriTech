import React, { useState } from 'react';
import { ProductListing, CropCategory } from '../../types';
import { 
  ArrowLeft, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  MoreVertical, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle,
  MapPin,
  TrendingUp
} from 'lucide-react';

interface FarmerProductsProps {
  products: ProductListing[];
  onNavigate: (view: string, extra?: any) => void;
  onToggleStatus: (id: string) => void;
  onDeleteProduct: (id: string) => void;
}

export const FarmerProducts: React.FC<FarmerProductsProps> = ({
  products,
  onNavigate,
  onToggleStatus,
  onDeleteProduct,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((prod) => {
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
              onClick={() => onNavigate('farmer-dashboard')}
              className="inline-flex items-center gap-1 text-xs text-[#9DF1C0] hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Farmer Dashboard</span>
            </button>
            <h1 className="text-xl sm:text-3xl font-black text-white">Manage Crop Listings</h1>
            <p className="text-xs text-[#C1C8C2] mt-0.5">Control pricing, stock quantities, and visibility of your harvests.</p>
          </div>

          <button
            onClick={() => onNavigate('farmer-add-crop')}
            className="bg-[#9DF1C0] hover:bg-[#86E4AD] text-[#002517] font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-98 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-[#002517]" />
            <span>Post New Crop</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-3xl border border-[#E7DDC8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your crop listings..."
              className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl pl-10 pr-4 py-2 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {['All', 'Active', 'Draft', 'Sold Out'].map((st) => (
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

        {/* Listings Table */}
        <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F5EF] border-b border-[#E7DDC8] text-[11px] font-bold text-[#717973] uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Crop / Listing</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price / Unit</th>
                  <th className="py-3 px-4">Stock Left</th>
                  <th className="py-3 px-4">Harvest Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DDC8] text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#717973]">
                      No crop listings found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#F7F5EF]/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <h4 className="font-bold text-[#002517] line-clamp-1">{prod.title}</h4>
                            <span className="text-[11px] text-[#717973]">{prod.grade} • {prod.location}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-[#525B54]">
                        {prod.category}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-black text-[#002517]">₹{prod.pricePerUnit}</span>
                        <span className="text-[10px] text-[#717973]">/{prod.unit}</span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-[#002517]">
                        {prod.quantityAvailable} {prod.unit}
                      </td>

                      <td className="py-4 px-4 text-[#525B54]">
                        {prod.harvestDate}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          prod.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-900'
                            : prod.status === 'Draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {prod.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNavigate('product-details', { product: prod })}
                            className="p-1.5 rounded-lg text-[#717973] hover:text-[#002517] hover:bg-[#F7F5EF]"
                            title="View Public Listing"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onToggleStatus(prod.id)}
                            className="p-1.5 rounded-lg text-[#717973] hover:text-[#0D6C45] hover:bg-[#E6F0E8]"
                            title={prod.status === 'Active' ? 'Pause Listing' : 'Activate Listing'}
                          >
                            {prod.status === 'Active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => onDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg text-[#717973] hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
