export type UserRole = 'public' | 'farmer' | 'buyer' | 'admin';

export type CropCategory = 
  | 'Vegetables'
  | 'Fruits'
  | 'Grains'
  | 'Pulses'
  | 'Oilseeds'
  | 'Spices'
  | 'Cash Crops';

export type CropUnit = 'kg' | 'quintal' | 'ton' | 'crate' | 'bag';

export type ProductStatus = 'Active' | 'Draft' | 'Paused' | 'Sold Out';

export interface FarmerProfile {
  id: string;
  name: string;
  avatar: string;
  location: string;
  district: string;
  state: string;
  phone: string;
  isVerified: boolean;
  kycStatus: 'Verified' | 'Pending' | 'Rejected';
  rating: number;
  reviewCount: number;
  completedOrders: number;
  joinedDate: string;
  farmSizeAcres: number;
  primaryCrops: string[];
}

export interface BuyerProfile {
  id: string;
  name: string;
  companyName?: string;
  avatar: string;
  location: string;
  state: string;
  phone: string;
  buyerType: 'Trader' | 'Wholesaler' | 'Retailer' | 'Processor' | 'Direct Consumer';
  isVerified: boolean;
  totalPurchasesAmount: number;
  completedOrders: number;
  joinedDate: string;
}

export interface ProductListing {
  id: string;
  title: string;
  cropName: string;
  category: CropCategory;
  variety?: string;
  grade: 'Grade A' | 'Grade B' | 'Standard' | 'Organic';
  pricePerUnit: number;
  unit: CropUnit;
  marketBenchmarkPrice: number;
  quantityAvailable: number;
  minOrderQuantity: number;
  location: string;
  district: string;
  state: string;
  farmerId: string;
  farmer: FarmerProfile;
  harvestDate: string;
  availabilityDate: string;
  shelfLifeDays: number;
  description: string;
  images: string[];
  status: ProductStatus;
  viewsCount: number;
  requestsCount: number;
  featured?: boolean;
  organicCertified?: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface BuyerRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerCompany?: string;
  buyerType: string;
  buyerAvatar: string;
  buyerLocation: string;
  productId: string;
  cropName: string;
  requestedQuantity: number;
  unit: CropUnit;
  offeredPrice: number;
  totalOfferedValue: number;
  listingPrice?: number;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Counter Offered';
  counterPrice?: number;
  counterNote?: string;
  requestedDate?: string;
  createdAt?: string;
}

export type OrderStatus = 
  | 'Placed'
  | 'Confirmed'
  | 'Accepted'
  | 'Processing'
  | 'Shipped'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled'
  | 'Delayed'
  | 'Reported';

export interface OrderItem {
  id: string;
  orderNumber: string;
  productId: string;
  cropName: string;
  productImage?: string;
  farmerId: string;
  farmerName: string;
  farmerLocation?: string;
  farmerPhone?: string;
  buyerId: string;
  buyerName: string;
  buyerLocation?: string;
  buyerPhone?: string;
  quantity: number;
  unit: CropUnit;
  pricePerUnit: number;
  totalAmount: number;
  status: OrderStatus;
  placedDate?: string;
  createdAt?: string;
  expectedDelivery?: string;
  deliveredDate?: string;
  trackingId?: string;
  transportVehicle?: string;
  deliveryLocation?: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  escrowStatus: 'Held' | 'Held in Escrow' | 'Released' | 'Released to Farmer' | 'Refunded';
  timeline?: {
    status: OrderStatus;
    timestamp: string;
    description: string;
    completed: boolean;
  }[];
}

export interface AdminEscrowLedger {
  id: string;
  orderId: string;
  amount: number;
  farmerName: string;
  buyerName: string;
  status: 'Held in Escrow' | 'Released to Farmer' | 'Refunded';
  createdAt: string;
  disputeFlag: boolean;
}

export interface MandiMarketPrice {
  id: string;
  cropName: string;
  category: CropCategory;
  mandi: string;
  district: string;
  state: string;
  currentPrice: number; // in ₹/kg or ₹/quintal
  unit: '₹/kg' | '₹/quintal';
  previousPrice: number;
  changePercentage: number;
  sevenDayAvg: number;
  thirtyDayAvg: number;
  arrivalQuantityQuintals: number;
  source: 'APMC Live Feed' | 'AgMarkNet' | 'Mandi Verified Agent';
  verificationStatus: 'Verified' | 'Estimated';
  updatedAt: string;
  trend: 'up' | 'down' | 'stable';
  aiInsight?: string;
}

export interface LogisticsQuote {
  id: string;
  vehicleType: 'Mini Truck (1-2 Tons)' | 'Light Commercial Vehicle (2-4 Tons)' | 'Heavy Multi-Axle (5-10 Tons)' | 'Cold Storage Container';
  capacityDescription: string;
  baseFare: number;
  perKmRate: number;
  estimatedCost: number;
  estimatedHours: number;
  distanceKm: number;
  pickupLocation: string;
  deliveryLocation: string;
  suitableFor: string[];
}

export interface LogisticsBooking {
  id: string;
  bookingRef: string;
  orderId?: string;
  cropName: string;
  cargoWeightKg: number;
  pickupLocation: string;
  deliveryLocation: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  estimatedCost: number;
  status: 'Booked' | 'Dispatched' | 'In Transit' | 'Arrived' | 'Delivered';
  eta: string;
  bookedAt: string;
}

export interface AppNotification {
  id: string;
  category: 'Orders' | 'Market' | 'Logistics' | 'AI Insights' | 'System';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkAction?: string;
  targetRole?: UserRole;
}

export interface ReportItem {
  id: string;
  category: 'Incorrect Listing' | 'User Complaint' | 'Pricing Complaint' | 'Delivery Issue';
  reporterName: string;
  reporterRole: 'Farmer' | 'Buyer' | 'System';
  reportedEntityName: string;
  entityType: 'Product' | 'Farmer' | 'Buyer' | 'Delivery';
  details: string;
  status: 'New' | 'Investigating' | 'Resolved' | 'Rejected';
  createdAt: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ProductReview {
  id: string;
  buyerName: string;
  buyerCompany?: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}
