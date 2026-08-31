import React, { useState } from 'react';
import { ProductListing, UserRole, LogisticsQuote } from '../../types';
import { mockReviews, mockLogisticsQuotes } from '../../data/mockData';
import { AIInsightCard } from '../../components/common/AIInsightCard';
import { 
  ArrowLeft, 
  MapPin, 
  BadgeCheck, 
  Star, 
  ShieldCheck, 
  Truck, 
  Calendar, 
  Clock, 
  Phone, 
  MessageSquare, 
  Share2, 
  Heart, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Minus,
  TrendingUp,
  Info,
  Scale
} from 'lucide-react';

interface ProductDetailsPageProps {
  product: ProductListing;
  onNavigate: (view: string, extra?: any) => void;
  onOpenAuthModal: (role?: UserRole) => void;
  onOrderPlaced: (orderDetails: any) => void;
  onRequestSubmitted: (requestDetails: any) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  onNavigate,
  onOpenAuthModal,
  onOrderPlaced,
  onRequestSubmitted,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || '');
  const [orderQuantity, setOrderQuantity] = useState<number>(product.minOrderQuantity || 100);
  const [offerPrice, setOfferPrice] = useState<number>(product.pricePerUnit);
  const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'logistics' | 'reviews'>('overview');
  
  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('Navi Mumbai APMC Terminal');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const totalPrice = orderQuantity * product.pricePerUnit;
  const totalOfferPrice = orderQuantity * offerPrice;
  const mandiDifference = product.marketBenchmarkPrice - product.pricePerUnit;

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOrderPlaced({
      productId: product.id,
      cropName: product.title,
      quantity: orderQuantity,
      unit: product.unit,
      pricePerUnit: product.pricePerUnit,
      totalAmount: totalPrice,
      farmerId: product.farmerId,
      farmerName: product.farmer.name,
      deliveryLocation,
      specialInstructions
    });
    setShowOrderModal(false);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestSubmitted({
      productId: product.id,
      cropName: product.title,
      requestedQuantity: orderQuantity,
      unit: product.unit,
      offeredPrice: offerPrice,
      totalOfferedValue: totalOfferPrice,
      farmerId: product.farmerId,
      message: specialInstructions
    });
    setShowRequestModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => onNavigate('marketplace')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D6C45] hover:text-[#002517] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: IMAGE GALLERY */}
          <div className="lg:col-span-6 space-y-4">
            {/* Active Big Image */}
            <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden bg-[#E6F0E8] border border-[#E7DDC8] shadow-sm">
              <img
                src={selectedImage}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-[#002517]/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full">
                  {product.grade}
                </span>
                {product.organicCertified && (
                  <span className="bg-[#9DF1C0] text-[#002517] text-xs font-bold px-3 py-1 rounded-full">
                    Certified Organic
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#717973] hover:text-rose-600 transition-colors shadow-sm"
                  aria-label="Save"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs text-[#002517] text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
                {product.quantityAvailable} {product.unit} In Stock
              </div>
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? 'border-[#0D6C45] ring-2 ring-[#9DF1C0]'
                        : 'border-[#E7DDC8] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* AI Crop Intelligence Card */}
            <AIInsightCard
              variant="card"
              insight={`Mandi rates for ${product.cropName} are holding steady. Based on arrival volumes in ${product.district}, this batch is priced ~${mandiDifference >= 0 ? `${mandiDifference}₹ lower than` : 'competitive with'} local APMC averages.`}
              actionLabel="Check Mandi Trends"
              onAction={() => onNavigate('market-prices')}
            />
          </div>

          {/* RIGHT: PRODUCT PRICING & ACTION PANEL */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header Title & Location */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#717973]">
                <span className="font-bold uppercase tracking-wider text-[#0D6C45]">{product.category}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0D6C45]" />
                  {product.location}, {product.district}, {product.state}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#002517] tracking-tight">
                {product.title}
              </h1>

              {product.variety && (
                <div className="text-xs text-[#525B54]">
                  Variety: <span className="font-semibold text-[#002517]">{product.variety}</span>
                </div>
              )}
            </div>

            {/* Pricing Box */}
            <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#717973] block">Direct Farmer Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#002517]">
                      ₹{product.pricePerUnit}
                    </span>
                    <span className="text-sm font-medium text-[#717973]">/{product.unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#717973] block">APMC Mandi Avg</span>
                  <span className="text-sm font-bold line-through text-[#717973]">
                    ₹{product.marketBenchmarkPrice}/{product.unit}
                  </span>
                  {mandiDifference > 0 && (
                    <span className="block text-xs font-bold text-emerald-700">
                      Save ₹{mandiDifference}/{product.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="pt-4 border-t border-[#E7DDC8] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#002517]">
                  <span>Order Quantity ({product.unit})</span>
                  <span className="text-[#717973]">Min Order: {product.minOrderQuantity} {product.unit}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(Math.max(product.minOrderQuantity, orderQuantity - 50))}
                    className="w-10 h-10 rounded-xl bg-[#F7F5EF] border border-[#C1C8C2] flex items-center justify-center text-[#002517] hover:bg-[#E6F0E8] font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(product.minOrderQuantity, Number(e.target.value)))}
                    className="flex-1 text-center font-black text-lg bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl py-2 text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  />

                  <button
                    type="button"
                    onClick={() => setOrderQuantity(Math.min(product.quantityAvailable, orderQuantity + 50))}
                    className="w-10 h-10 rounded-xl bg-[#F7F5EF] border border-[#C1C8C2] flex items-center justify-center text-[#002517] hover:bg-[#E6F0E8] font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Total Calculation */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-[#717973]">Estimated Crop Subtotal:</span>
                  <span className="text-base font-black text-[#002517]">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="w-full bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4 text-[#9DF1C0]" />
                  <span>Buy via Escrow (₹{totalPrice.toLocaleString('en-IN')})</span>
                </button>

                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full bg-[#E6F0E8] hover:bg-[#D7E4DA] text-[#002517] font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Scale className="w-4 h-4 text-[#0D6C45]" />
                  <span>Negotiate / Make Offer</span>
                </button>
              </div>
            </div>

            {/* Farmer Profile Box */}
            <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={product.farmer.avatar}
                    alt={product.farmer.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#9DF1C0]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-[#002517]">{product.farmer.name}</h3>
                      {product.farmer.isVerified && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-[#E6F0E8] text-[#0D6C45] px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>KYC Verified</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#717973] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {product.farmer.location}, {product.farmer.state} • {product.farmer.farmSizeAcres} Acre Farm
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-bold text-[#002517]">
                    <Star className="w-3.5 h-3.5 fill-[#C2962A] text-[#C2962A]" />
                    <span>{product.farmer.rating}</span>
                  </div>
                  <span className="text-[10px] text-[#717973] block">{product.farmer.completedOrders} orders</span>
                </div>
              </div>

              {/* Direct Communication Strip */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E7DDC8]">
                <a
                  href={`tel:${product.farmer.phone}`}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-[#F7F5EF] hover:bg-[#E6F0E8] text-[#002517] text-xs font-bold rounded-xl transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0D6C45]" />
                  <span>{product.farmer.phone}</span>
                </a>

                <button
                  onClick={() => setShowRequestModal(true)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-[#F7F5EF] hover:bg-[#E6F0E8] text-[#002517] text-xs font-bold rounded-xl transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#0D6C45]" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>

            {/* Escrow Guarantee Pill */}
            <div className="flex items-center gap-3 p-3.5 bg-[#F2FCF3] border border-[#9DF1C0] rounded-2xl text-xs text-[#002517]">
              <ShieldCheck className="w-5 h-5 text-[#0D6C45] shrink-0" />
              <div>
                <span className="font-bold">AgriTech Escrow Protection</span>
                <p className="text-[11px] text-[#525B54] mt-0.5">
                  Payment is only released to the farmer after doorstep weight & quality inspection approval.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TABS: OVERVIEW, MANDI COMPARISON, LOGISTICS, REVIEWS */}
        <div className="mt-12 bg-white rounded-3xl border border-[#E7DDC8] shadow-xs overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-[#E7DDC8] overflow-x-auto no-scrollbar bg-[#F7F5EF]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-[#002517] text-[#002517] bg-white'
                  : 'border-transparent text-[#717973] hover:text-[#002517]'
              }`}
            >
              Description & Quality Specs
            </button>

            <button
              onClick={() => setActiveTab('market')}
              className={`py-4 px-6 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'market'
                  ? 'border-[#002517] text-[#002517] bg-white'
                  : 'border-transparent text-[#717973] hover:text-[#002517]'
              }`}
            >
              Mandi Rate Comparison
            </button>

            <button
              onClick={() => setActiveTab('logistics')}
              className={`py-4 px-6 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'logistics'
                  ? 'border-[#002517] text-[#002517] bg-white'
                  : 'border-transparent text-[#717973] hover:text-[#002517]'
              }`}
            >
              Farm Gate Logistics
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-[#002517] text-[#002517] bg-white'
                  : 'border-transparent text-[#717973] hover:text-[#002517]'
              }`}
            >
              Verified Reviews ({mockReviews.length})
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 sm:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-[#002517] mb-2">Produce Description</h4>
                  <p className="text-xs sm:text-sm text-[#525B54] leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E7DDC8]">
                  <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8]">
                    <span className="text-[11px] text-[#717973] block">Harvest Date</span>
                    <span className="text-xs font-bold text-[#002517] mt-0.5 block">{product.harvestDate}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8]">
                    <span className="text-[11px] text-[#717973] block">Shelf Life</span>
                    <span className="text-xs font-bold text-[#002517] mt-0.5 block">{product.shelfLifeDays} Days</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8]">
                    <span className="text-[11px] text-[#717973] block">Quality Grade</span>
                    <span className="text-xs font-bold text-[#002517] mt-0.5 block">{product.grade}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8]">
                    <span className="text-[11px] text-[#717973] block">Availability</span>
                    <span className="text-xs font-bold text-[#002517] mt-0.5 block">{product.availabilityDate}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#002517]">Live APMC Benchmarks for {product.cropName}</h4>
                  <span className="text-xs text-[#0D6C45] font-semibold">Live feeds updated every 30m</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F2FCF3] border border-[#9DF1C0]">
                    <span className="text-xs text-[#717973]">This Listing (Direct Farm)</span>
                    <div className="text-xl font-black text-[#002517] mt-1">₹{product.pricePerUnit}/{product.unit}</div>
                    <span className="text-[11px] text-[#0D6C45] font-bold">0% Mandi Cess</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8]">
                    <span className="text-xs text-[#717973]">Pune APMC Market</span>
                    <div className="text-xl font-black text-[#002517] mt-1">₹26.00/kg</div>
                    <span className="text-[11px] text-[#717973]">+2.5% Mandi Cess</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8]">
                    <span className="text-xs text-[#717973]">Vashi APMC Navi Mumbai</span>
                    <div className="text-xl font-black text-[#002517] mt-1">₹28.50/kg</div>
                    <span className="text-[11px] text-[#717973]">+Transport premium</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logistics' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#002517]">Recommended Transport Carriers</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockLogisticsQuotes.slice(0, 2).map((quote) => (
                    <div key={quote.id} className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#002517]">{quote.vehicleType}</span>
                        <span className="text-xs font-black text-[#0D6C45]">Est. ₹{quote.estimatedCost}</span>
                      </div>
                      <p className="text-[11px] text-[#717973]">{quote.capacityDescription}</p>
                      <div className="text-[11px] text-[#525B54]">Est. Transit: {quote.estimatedHours} hrs to Pune/Mumbai</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {mockReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#002517]">{rev.buyerName}</span>
                        {rev.buyerCompany && <span className="text-[11px] text-[#717973]">({rev.buyerCompany})</span>}
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] bg-[#E6F0E8] text-[#0D6C45] font-bold px-2 py-0.5 rounded-full">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-[#C2962A] text-xs">
                        {'★'.repeat(Math.floor(rev.rating))}
                      </div>
                    </div>
                    <p className="text-xs text-[#525B54]">{rev.comment}</p>
                    <span className="text-[10px] text-[#717973]">{rev.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: DIRECT ESCROW ORDER */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowOrderModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E7DDC8] z-10">
            <h3 className="text-base font-bold text-[#002517] mb-1">Confirm Escrow Purchase Order</h3>
            <p className="text-xs text-[#717973] mb-4">
              Funds are deposited safely in AgriTech Escrow and released only after delivery QC verification.
            </p>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="p-3.5 bg-[#F7F5EF] rounded-2xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#717973]">Crop:</span>
                  <span className="font-bold text-[#002517]">{product.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717973]">Quantity:</span>
                  <span className="font-bold text-[#002517]">{orderQuantity} {product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717973]">Rate:</span>
                  <span className="font-bold text-[#002517]">₹{product.pricePerUnit}/{product.unit}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E7DDC8] font-black text-[#002517] text-sm">
                  <span>Total Escrow Amount:</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] mb-1">Delivery Destination Address</label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2.5 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] mb-1">Packaging / Delivery Instructions</label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Please use 25kg plastic crates, morning delivery preferred."
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl p-3 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-[#F7F5EF] text-[#525B54] font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#002517] text-white font-bold py-3 rounded-xl text-xs shadow-md"
                >
                  Confirm & Lock Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MAKE COUNTER OFFER */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowRequestModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E7DDC8] z-10">
            <h3 className="text-base font-bold text-[#002517] mb-1">Make Custom Purchase Offer</h3>
            <p className="text-xs text-[#717973] mb-4">
              Send a price quote directly to Farmer {product.farmer.name}.
            </p>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#002517] mb-1">Requested Quantity ({product.unit})</label>
                <input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2.5 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] mb-1">Your Offered Price (₹/{product.unit})</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3.5 py-2.5 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002517] mb-1">Message to Farmer</label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Describe your delivery terms or payment preferences..."
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl p-3 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-[#F7F5EF] text-[#525B54] font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#002517] text-white font-bold py-3 rounded-xl text-xs shadow-md"
                >
                  Send Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
