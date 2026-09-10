import React, { useState } from 'react';
import { ProductListing, CropCategory, CropUnit } from '../../types';
import {
  ArrowLeft,
  Store,
  CheckCircle2
} from 'lucide-react';

interface SellerAddProductProps {
  onNavigate: (view: string) => void;
  onPublishProduct: (productData: Partial<ProductListing>) => void;
}

export const SellerAddProduct: React.FC<SellerAddProductProps> = ({
  onNavigate,
  onPublishProduct,
}) => {
  const [title, setTitle] = useState('');
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Vegetables');
  const [variety, setVariety] = useState('');
  const [grade, setGrade] = useState<'Grade A' | 'Grade B' | 'Standard' | 'Organic'>('Grade A');
  const [pricePerUnit, setPricePerUnit] = useState<number>(30);
  const [unit, setUnit] = useState<CropUnit>('kg');
  const [quantityAvailable, setQuantityAvailable] = useState<number>(1000);
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(100);
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(14);
  const [description, setDescription] = useState('');
  const [organicCertified, setOrganicCertified] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800');

  const handleSubmit = (e: React.FormEvent, status: 'Active' | 'Draft') => {
    e.preventDefault();
    if (!cropName || !title) return;

    onPublishProduct({
      title: title.trim(),
      cropName: cropName.trim(),
      category,
      variety: variety.trim() || undefined,
      grade,
      pricePerUnit: Number(pricePerUnit),
      unit,
      quantityAvailable: Number(quantityAvailable),
      minOrderQuantity: Number(minOrderQuantity),
      location: `${district}, ${state}`,
      district,
      state,
      harvestDate,
      availabilityDate: 'Immediate',
      shelfLifeDays: Number(shelfLifeDays),
      description: description.trim(),
      imageUrl,
      status,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Header */}
      <div className="bg-[#002517] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('seller-products')}
            className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Seller Inventory</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Store className="w-7 h-7 text-indigo-400" />
            <span>List Commercial Produce Lot</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#C1C8C2] mt-1">
            Publish an agricultural wholesale lot for commercial buyers and food processors
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <form onSubmit={(e) => handleSubmit(e, 'Active')} className="space-y-8">
          {/* Produce Classification */}
          <div className="bg-white border border-[#E7DDC8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-[#002517] border-b border-[#E7DDC8] pb-3">
              1. Produce Specification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Produce Listing Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Export-Quality Red Onions (Medium-Large)"
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Crop Name *
                </label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Red Onion, Wheat, Tomato, Soybean"
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CropCategory)}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Oilseeds">Oilseeds</option>
                  <option value="Spices">Spices</option>
                  <option value="Cash Crops">Cash Crops</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Variety
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Nashik Red / Sharbati / Hybrid"
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Quality Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                >
                  <option value="Grade A">Grade A (Premium Wholesale)</option>
                  <option value="Grade B">Grade B (Standard Commercial)</option>
                  <option value="Standard">Standard</option>
                  <option value="Organic">Organic Certified</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Shelf Life (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={shelfLifeDays}
                  onChange={(e) => setShelfLifeDays(Number(e.target.value))}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Lot Volume */}
          <div className="bg-white border border-[#E7DDC8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-[#002517] border-b border-[#E7DDC8] pb-3">
              2. Commercial Pricing & Inventory Volumes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Price per Unit (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(Number(e.target.value))}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Trading Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as CropUnit)}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="quintal">Quintal (100kg)</option>
                  <option value="ton">Ton (1000kg)</option>
                  <option value="crate">Crate (20-25kg)</option>
                  <option value="bag">Bag (50kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Total Available Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantityAvailable}
                  onChange={(e) => setQuantityAvailable(Number(e.target.value))}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Minimum Order Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(Number(e.target.value))}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  Warehouse District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Nashik, Pune, Thane"
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#002517] uppercase tracking-wider mb-1.5">
                Detailed Batch Description & Specifications
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe moisture level, packaging (gunny bags / crates), dispatch readiness, sorting specifications..."
                className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl p-3 text-xs text-[#002517] focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'Draft')}
              className="px-6 py-3 rounded-xl bg-white border border-[#E7DDC8] text-xs font-bold text-[#525B54] hover:bg-slate-50 cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish to Marketplace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
