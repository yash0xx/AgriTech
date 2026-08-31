import React, { useState } from 'react';
import { ProductListing, CropCategory, CropUnit } from '../../types';
import { 
  ArrowLeft, 
  Sprout, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Info, 
  Image as ImageIcon, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface FarmerAddCropProps {
  onNavigate: (view: string) => void;
  onPublishCrop: (cropData: Partial<ProductListing>) => void;
}

export const FarmerAddCrop: React.FC<FarmerAddCropProps> = ({
  onNavigate,
  onPublishCrop,
}) => {
  const [cropName, setCropName] = useState('Fresh Red Tomatoes');
  const [category, setCategory] = useState<CropCategory>('Vegetables');
  const [variety, setVariety] = useState('Abhinav Hybrid Red');
  const [grade, setGrade] = useState<'Grade A' | 'Grade B' | 'Standard' | 'Organic'>('Grade A');
  const [pricePerUnit, setPricePerUnit] = useState<number>(25);
  const [unit, setUnit] = useState<CropUnit>('kg');
  const [quantityAvailable, setQuantityAvailable] = useState<number>(500);
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(50);
  const [location, setLocation] = useState('Dindori Road, Nashik');
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [harvestDate, setHarvestDate] = useState('2026-08-31');
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(7);
  const [description, setDescription] = useState('Naturally ripened Grade A tomatoes with uniform color, firm skin, and high pulp content. Harvested at early morning peak freshness.');
  const [organicCertified, setOrganicCertified] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80');

  // Benchmark logic
  const getBenchmarkRate = () => {
    switch (category) {
      case 'Vegetables': return 26;
      case 'Grains': return 34;
      case 'Fruits': return 82;
      case 'Spices': return 118;
      case 'Oilseeds': return 51;
      case 'Cash Crops': return 70;
      default: return 30;
    }
  };

  const currentBenchmark = getBenchmarkRate();

  const handleSubmit = (e: React.FormEvent, status: 'Active' | 'Draft') => {
    e.preventDefault();
    onPublishCrop({
      title: cropName,
      cropName: cropName.split(' ')[0],
      category,
      variety,
      grade,
      pricePerUnit,
      unit,
      marketBenchmarkPrice: currentBenchmark,
      quantityAvailable,
      minOrderQuantity,
      location,
      district,
      state,
      harvestDate,
      availabilityDate: 'Immediate',
      shelfLifeDays,
      description,
      images: [imageUrl],
      status,
      organicCertified,
      viewsCount: 0,
      requestsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: 'Just now'
    });
    onNavigate('farmer-products');
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Top Breadcrumb Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => onNavigate('farmer-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D6C45] hover:text-[#002517] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D6C45] mb-1">
            <Sprout className="w-4 h-4" />
            <span>Produce Direct Listing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#002517]">
            Post New Crop Harvest
          </h1>
          <p className="text-xs sm:text-sm text-[#525B54] mt-0.5">
            Publish your produce details with live APMC benchmark guidance to attract verified wholesale buyers.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: ADD CROP FORM */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#E7DDC8] shadow-xs">
            <form onSubmit={(e) => handleSubmit(e, 'Active')} className="space-y-5">
              
              {/* Crop Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Listing Title / Crop Name *
                  </label>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Fresh Red Tomatoes (Grade A)"
                    className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Crop Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  >
                    <option value="Vegetables">Vegetables (सब्जियां)</option>
                    <option value="Fruits">Fruits (फल)</option>
                    <option value="Grains">Grains (अनाज)</option>
                    <option value="Pulses">Pulses (दालें)</option>
                    <option value="Oilseeds">Oilseeds (तिलहन)</option>
                    <option value="Spices">Spices (मसाले)</option>
                    <option value="Cash Crops">Cash Crops (नकदी फसलें)</option>
                  </select>
                </div>
              </div>

              {/* Variety & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Variety / Seed Type
                  </label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Abhinav Hybrid"
                    className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Quality Grade *
                  </label>
                  <select
                    value={grade}
                    onChange={(e: any) => setGrade(e.target.value)}
                    className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  >
                    <option value="Grade A">Grade A (Premium Export)</option>
                    <option value="Grade B">Grade B (Standard Market)</option>
                    <option value="Standard">Standard (Industrial/Processing)</option>
                    <option value="Organic">Certified Organic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Unit of Measurement *
                  </label>
                  <select
                    value={unit}
                    onChange={(e: any) => setUnit(e.target.value)}
                    className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="quintal">Quintal (100 kg)</option>
                    <option value="ton">Metric Ton (1,000 kg)</option>
                    <option value="crate">Crate (25 kg)</option>
                    <option value="bag">Bag (50 kg)</option>
                  </select>
                </div>
              </div>

              {/* Price & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Expected Rate (₹/{unit}) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717973]">₹</span>
                    <input
                      type="number"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(Number(e.target.value))}
                      className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl pl-7 pr-3 py-2 text-xs sm:text-sm font-bold text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Available Stock ({unit}) *
                  </label>
                  <input
                    type="number"
                    value={quantityAvailable}
                    onChange={(e) => setQuantityAvailable(Number(e.target.value))}
                    className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Min Order Quantity ({unit})
                  </label>
                  <input
                    type="number"
                    value={minOrderQuantity}
                    onChange={(e) => setMinOrderQuantity(Number(e.target.value))}
                    className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  />
                </div>
              </div>

              {/* Location & Harvest Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Farm Gate Location / Taluka
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Dindori Road"
                    className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">
                    Shelf Life (Days)
                  </label>
                  <input
                    type="number"
                    value={shelfLifeDays}
                    onChange={(e) => setShelfLifeDays(Number(e.target.value))}
                    className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#002517] mb-1">
                  Produce Description & Quality Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention soil type, irrigation source, packing type, pesticide compliance..."
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl p-3 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                />
              </div>

              {/* Image URL preview */}
              <div>
                <label className="block text-xs font-bold text-[#002517] mb-1">
                  Crop Image URL (or Photo sample)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-xs text-[#002517] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E7DDC8] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'Draft')}
                  className="w-full sm:w-auto bg-[#F7F5EF] hover:bg-[#E6F0E8] text-[#525B54] font-bold py-3 px-5 rounded-xl text-xs transition-colors"
                >
                  Save as Draft
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-3 px-8 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#9DF1C0]" />
                  <span>Publish Listing to Marketplace</span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: LIVE MANDI ASSISTANT & PRICING HELPER */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live APMC Pricing Helper */}
            <div className="bg-[#F2FCF3] border border-[#9DF1C0] p-5 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D6C45]">
                <Sparkles className="w-4 h-4" />
                <span>Live Mandi Price Helper</span>
              </div>

              <div>
                <span className="text-xs text-[#717973]">Current APMC Benchmark for {category}:</span>
                <div className="text-3xl font-black text-[#002517] mt-0.5">
                  ₹{currentBenchmark}/{unit}
                </div>
                <span className="text-[11px] text-[#0D6C45] font-semibold">
                  Suggested Listing Range: ₹{currentBenchmark - 2} – ₹{currentBenchmark + 2}/{unit}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#9DF1C0]/60 text-xs space-y-1.5 text-[#002517]">
                <span className="font-bold block">💡 Pricing Tip for Quick Sale:</span>
                <p className="text-[11px] text-[#525B54] leading-relaxed">
                  Listings priced ₹1-₹2 below mandi benchmark typically receive confirmed buyer purchase requests within 6 hours.
                </p>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#002517]">
                Listing Checklist
              </h3>
              <ul className="space-y-2 text-xs text-[#525B54]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6C45] shrink-0" />
                  <span>Accurate weight verified</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6C45] shrink-0" />
                  <span>Harvest date within 7 days</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6C45] shrink-0" />
                  <span>0% Middleman commission</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6C45] shrink-0" />
                  <span>Escrow payment guaranteed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
