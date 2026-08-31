import React, { useState, useMemo } from 'react';
import { ProductListing, CropCategory, UserRole } from '../../types';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  BadgeCheck, 
  Star, 
  ArrowUpDown, 
  Heart, 
  Check, 
  X, 
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Store,
  Tag
} from 'lucide-react';

interface MarketplacePageProps {
  products: ProductListing[];
  initialCategory?: string;
  initialQuery?: string;
  onNavigate: (view: string, extra?: any) => void;
  onOpenAuthModal: (role?: UserRole) => void;
  onQuickRequestCrop?: (product: ProductListing) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  products,
  initialCategory,
  initialQuery = '',
  onNavigate,
  onOpenAuthModal,
  onQuickRequestCrop,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(150);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'quantity-desc'>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['prod-1']);

  const categories: string[] = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Oilseeds', 'Spices', 'Cash Crops'];
  const districts: string[] = ['All', 'Pune', 'Nashik', 'Ahmednagar', 'Satara', 'Mumbai'];

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Query match
      const queryMatch = 
        prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.district.toLowerCase().includes(searchQuery.toLowerCase());

      // Category match
      const categoryMatch = selectedCategory === 'All' || prod.category === selectedCategory;

      // District match
      const districtMatch = selectedDistrict === 'All' || prod.district.toLowerCase() === selectedDistrict.toLowerCase();

      // Price match
      const priceMatch = prod.pricePerUnit <= maxPrice;

      // Verified match
      const verifiedMatch = !verifiedOnly || prod.farmer.isVerified;

      // Organic match
      const organicMatch = !organicOnly || prod.organicCertified;

      return queryMatch && categoryMatch && districtMatch && priceMatch && verifiedMatch && organicMatch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerUnit - b.pricePerUnit;
      if (sortBy === 'price-desc') return b.pricePerUnit - a.pricePerUnit;
      if (sortBy === 'quantity-desc') return b.quantityAvailable - a.quantityAvailable;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, selectedDistrict, maxPrice, verifiedOnly, organicOnly, sortBy]);

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-20">
      
      {/* Header Banner */}
      <div className="bg-[#002517] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9DF1C0] mb-1">
                <Store className="w-4 h-4" />
                <span>Wholesale Agricultural Marketplace</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Fresh Produce Direct From Farmers
              </h1>
              <p className="text-xs sm:text-sm text-[#C1C8C2] mt-1 max-w-xl">
                Browse tested harvest batches from verified Maharashtra growers with transparent live mandi benchmarks.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-white/10 border border-white/15 px-4 py-2 rounded-2xl shrink-0 self-start md:self-auto">
              <span className="text-xs font-bold text-[#9DF1C0]">
                {filteredProducts.length} Listings Available
              </span>
              <span className="text-white/40">|</span>
              <span className="text-xs text-white/80">Avg ₹32.40/kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter & Products Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Top Controls Strip: Search, Categories & Sort */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7DDC8] shadow-xs mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by crop, farmer name, district (e.g., Tomato, Rajesh, Nashik)..."
                className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#002517]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden w-full sm:w-auto bg-[#E6F0E8] text-[#002517] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-xs text-[#717973] hidden sm:inline whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3 py-2 text-xs font-bold text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
              >
                <option value="recommended">Featured / Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="quantity-desc">Stock Quantity (Largest First)</option>
              </select>
            </div>
          </div>

          {/* Category Pills Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#002517] text-white shadow-xs'
                    : 'bg-[#F7F5EF] text-[#525B54] hover:bg-[#E6F0E8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Layout Grid (Sidebar + Product Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3 space-y-5">
            <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#E7DDC8] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#002517] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#0D6C45]" />
                  <span>Filter Listings</span>
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedDistrict('All');
                    setMaxPrice(150);
                    setVerifiedOnly(false);
                    setOrganicOnly(false);
                    setSearchQuery('');
                  }}
                  className="text-[11px] font-semibold text-[#0D6C45] hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-xs font-bold text-[#002517] mb-2">
                  Location / Mandi Hub
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3 py-2 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Maharashtra Districts' : `${d} Region`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#002517] mb-2">
                  <span>Max Price Per Unit</span>
                  <span className="text-[#0D6C45] font-black">₹{maxPrice}/kg</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#0D6C45] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#717973] mt-1">
                  <span>₹10/kg</span>
                  <span>₹150/kg</span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-[#E7DDC8]">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#002517]">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded text-[#0D6C45] focus:ring-[#0D6C45] w-4 h-4"
                  />
                  <span>Verified Farmers (KYC Done)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#002517]">
                  <input
                    type="checkbox"
                    checked={organicOnly}
                    onChange={(e) => setOrganicOnly(e.target.checked)}
                    className="rounded text-[#0D6C45] focus:ring-[#0D6C45] w-4 h-4"
                  />
                  <span>Certified Organic Only</span>
                </label>
              </div>

              {/* Mandi Intelligence Pill */}
              <div className="p-3.5 bg-[#F2FCF3] border border-[#9DF1C0] rounded-2xl text-xs space-y-1 text-[#002517]">
                <div className="flex items-center gap-1.5 font-bold text-[#0D6C45]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fair Trade Policy</span>
                </div>
                <p className="text-[11px] text-[#525B54] leading-relaxed">
                  Direct listings on AgriTech trade at 0% platform commission for smallholder farmers.
                </p>
              </div>
            </div>
          </aside>

          {/* PRODUCTS GRID */}
          <main className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E7DDC8] shadow-xs">
                <Store className="w-12 h-12 text-[#C1C8C2] mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-[#002517]">No crop listings found</h3>
                <p className="text-xs text-[#717973] mt-1 max-w-sm mx-auto">
                  Try adjusting your search keywords, increasing maximum price filter, or selecting "All Categories".
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedDistrict('All');
                    setMaxPrice(150);
                    setSearchQuery('');
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 bg-[#002517] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const isFav = favorites.includes(product.id);
                  const isPriceBelowMarket = product.pricePerUnit < product.marketBenchmarkPrice;

                  return (
                    <div
                      key={product.id}
                      onClick={() => onNavigate('product-details', { product })}
                      className="bg-white rounded-3xl border border-[#E7DDC8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                    >
                      {/* Image Header */}
                      <div className="relative h-44 sm:h-48 overflow-hidden bg-[#E6F0E8]">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="bg-[#002517]/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            {product.grade}
                          </span>
                          {product.organicCertified && (
                            <span className="bg-[#9DF1C0] text-[#002517] text-[10px] font-bold px-2.5 py-1 rounded-full">
                              Organic
                            </span>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => toggleFavorite(product.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#717973] hover:text-rose-600 transition-colors shadow-sm"
                          aria-label="Save to favorites"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        {/* Stock pill */}
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[#002517] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                          {product.quantityAvailable} {product.unit} Available
                        </div>
                      </div>

                      {/* Details Area */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[#717973] mb-1">
                            <span className="font-semibold text-[#0D6C45]">{product.category}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#717973]" />
                              {product.district}, {product.state}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-[#002517] group-hover:text-[#0D6C45] transition-colors line-clamp-1">
                            {product.title}
                          </h3>

                          {/* Farmer snippet */}
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E7DDC8]">
                            <img
                              src={product.farmer.avatar}
                              alt={product.farmer.name}
                              referrerPolicy="no-referrer"
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-xs text-[#525B54] font-medium truncate">
                                {product.farmer.name}
                              </span>
                              {product.farmer.isVerified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-[#0D6C45] shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-[#717973] ml-auto">
                              ★ {product.farmer.rating}
                            </span>
                          </div>
                        </div>

                        {/* Benchmark & Price Row */}
                        <div className="pt-2 border-t border-[#E7DDC8]">
                          <div className="flex items-center justify-between text-[10px] text-[#717973] mb-0.5">
                            <span>Direct Rate</span>
                            <span>Mandi Avg: ₹{product.marketBenchmarkPrice}/{product.unit}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-black text-[#002517]">
                                ₹{product.pricePerUnit}
                              </span>
                              <span className="text-xs font-medium text-[#717973]">/{product.unit}</span>
                              {isPriceBelowMarket && (
                                <span className="ml-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  Save ₹{product.marketBenchmarkPrice - product.pricePerUnit}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onQuickRequestCrop) {
                                  onQuickRequestCrop(product);
                                } else {
                                  onNavigate('product-details', { product });
                                }
                              }}
                              className="bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 shadow-xs active:scale-98"
                            >
                              <span>Request</span>
                              <ArrowRight className="w-3 h-3 text-[#9DF1C0]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER MODAL */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative bg-[#F7F5EF] min-h-screen p-6 max-w-md ml-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E7DDC8] mb-4">
                <h3 className="text-base font-bold text-[#002517]">Filters & Sorting</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg">
                  <X className="w-6 h-6 text-[#717973]" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-[#002517] mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                        selectedCategory === c ? 'bg-[#002517] text-white' : 'bg-white border border-[#C1C8C2]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* District */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-[#002517] mb-2">Mandi District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3 py-2 text-xs"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Price Slider */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold text-[#002517] mb-1">
                  <span>Max Price Per Unit</span>
                  <span>₹{maxPrice}/kg</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#0D6C45]"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded text-[#0D6C45]"
                  />
                  <span>Verified Farmers (KYC Done)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={organicOnly}
                    onChange={(e) => setOrganicOnly(e.target.checked)}
                    className="rounded text-[#0D6C45]"
                  />
                  <span>Certified Organic Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E7DDC8]">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-[#002517] text-white font-bold py-3 rounded-xl text-sm"
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
