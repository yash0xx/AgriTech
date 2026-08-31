import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  ProductListing, 
  BuyerRequest, 
  OrderItem, 
  MandiMarketPrice, 
  AdminEscrowLedger,
  AppNotification 
} from './types';

// Mock Data Source
import { 
  mockProducts, 
  mockBuyerRequests, 
  mockOrders, 
  mockMarketPrices, 
  mockEscrowLedger,
  mockNotifications as initialNotifications
} from './data/mockData';

// Common UI Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { AuthModals } from './components/common/AuthModals';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { Toast } from './components/common/Toast';

// Views
import { LandingPage } from './views/public/LandingPage';
import { MarketplacePage } from './views/public/MarketplacePage';
import { ProductDetailsPage } from './views/public/ProductDetailsPage';
import { MarketPricesPage } from './views/public/MarketPricesPage';
import { LogisticsPage } from './views/public/LogisticsPage';
import { HowItWorksPage } from './views/public/HowItWorksPage';
import { AboutPage } from './views/public/AboutPage';
import { NotFoundPage } from './views/public/NotFoundPage';

// Farmer Views
import { FarmerDashboard } from './views/farmer/FarmerDashboard';
import { FarmerAddCrop } from './views/farmer/FarmerAddCrop';
import { FarmerProducts } from './views/farmer/FarmerProducts';
import { FarmerBuyerRequests } from './views/farmer/FarmerBuyerRequests';
import { FarmerOrders } from './views/farmer/FarmerOrders';

// Buyer Views
import { BuyerDashboard } from './views/buyer/BuyerDashboard';
import { BuyerOrders } from './views/buyer/BuyerOrders';

// Admin Views
import { AdminDashboard } from './views/admin/AdminDashboard';

export default function App() {
  // Navigation & Role State
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeRole, setActiveRole] = useState<UserRole>('guest');
  const [selectedProduct, setSelectedProduct] = useState<ProductListing | null>(null);
  const [marketplaceQuery, setMarketplaceQuery] = useState<string>('');
  const [marketplaceCategory, setMarketplaceCategory] = useState<string>('All');

  // Application Data State
  const [products, setProducts] = useState<ProductListing[]>(mockProducts);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>(mockBuyerRequests);
  const [orders, setOrders] = useState<OrderItem[]>(mockOrders);
  const [marketPrices, setMarketPrices] = useState<MandiMarketPrice[]>(mockMarketPrices);
  const [escrowLedger, setEscrowLedger] = useState<AdminEscrowLedger[]>(mockEscrowLedger);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  // Modals & Drawers
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    role: UserRole;
    mode: 'login' | 'register';
  }>({
    isOpen: false,
    role: 'farmer',
    mode: 'login',
  });

  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  // Scroll to top on view navigation
  const navigateTo = (view: string, extra?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (extra?.product) {
      setSelectedProduct(extra.product);
    }
    if (extra?.query) {
      setMarketplaceQuery(extra.query);
    }
    if (extra?.category) {
      setMarketplaceCategory(extra.category);
    }
    setCurrentView(view);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Role Switch Handler
  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'farmer') {
      navigateTo('farmer-dashboard');
      showToast('Switched to Farmer Portal (Rajesh Patil, Nashik)');
    } else if (role === 'buyer') {
      navigateTo('buyer-dashboard');
      showToast('Switched to Buyer Portal (FreshFarm Logistics, Mumbai)');
    } else if (role === 'admin') {
      navigateTo('admin-dashboard');
      showToast('Switched to Admin Operations Console');
    } else {
      navigateTo('landing');
      showToast('Logged out to Public View');
    }
  };

  // Notification Handler
  const handleMarkAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Farmer Actions
  const handlePublishCrop = (newCropData: Partial<ProductListing>) => {
    const newProduct: ProductListing = {
      id: `prod-${Date.now()}`,
      farmerId: 'farmer-1',
      farmer: {
        id: 'farmer-1',
        name: 'Rajesh Patil',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
        location: 'Nashik',
        district: 'Nashik',
        state: 'Maharashtra',
        rating: 4.8,
        reviewCount: 38,
        completedOrders: 18,
        isVerified: true,
        kycStatus: 'Verified',
        joinedDate: '2024',
        farmSizeAcres: 12.5,
        primaryCrops: ['Tomato', 'Onion', 'Grapes'],
        phone: '+91 98231 45678'
      },
      title: newCropData.title || 'Fresh Harvest Produce',
      cropName: newCropData.cropName || 'Produce',
      category: newCropData.category || 'Vegetables',
      variety: newCropData.variety || 'Hybrid',
      grade: newCropData.grade || 'Grade A',
      pricePerUnit: newCropData.pricePerUnit || 25,
      unit: newCropData.unit || 'kg',
      marketBenchmarkPrice: newCropData.marketBenchmarkPrice || 26,
      quantityAvailable: newCropData.quantityAvailable || 500,
      minOrderQuantity: newCropData.minOrderQuantity || 50,
      location: newCropData.location || 'Nashik',
      district: newCropData.district || 'Nashik',
      state: 'Maharashtra',
      harvestDate: newCropData.harvestDate || '2026-08-31',
      availabilityDate: 'Immediate',
      shelfLifeDays: newCropData.shelfLifeDays || 7,
      description: newCropData.description || 'Fresh quality produce from our verified farm.',
      images: newCropData.images && newCropData.images.length > 0 ? newCropData.images : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'],
      status: newCropData.status || 'Active',
      featured: true,
      organicCertified: newCropData.organicCertified || false,
      viewsCount: 0,
      requestsCount: 0,
      createdAt: 'Today',
      updatedAt: 'Just now'
    };

    setProducts([newProduct, ...products]);
    showToast(`"${newProduct.title}" published successfully to marketplace!`);
  };

  const handleToggleProductStatus = (id: string) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Active' ? 'Paused' : 'Active';
        showToast(`Listing status updated to ${nextStatus}`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    showToast('Listing removed from marketplace');
  };

  const handleAcceptBuyerRequest = (requestId: string) => {
    const req = buyerRequests.find(r => r.id === requestId);
    if (!req) return;

    setBuyerRequests(buyerRequests.map(r => r.id === requestId ? { ...r, status: 'Accepted' } : r));

    // Create an active order
    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: req.productId,
      cropName: req.cropName,
      quantity: req.requestedQuantity,
      unit: req.unit,
      pricePerUnit: req.offeredPrice,
      totalAmount: req.totalOfferedValue,
      farmerId: 'farmer-1',
      farmerName: 'Rajesh Patil',
      buyerId: 'buyer-1',
      buyerName: req.buyerName,
      status: 'Confirmed',
      escrowStatus: 'Held',
      createdAt: 'Today',
      deliveryLocation: req.buyerLocation,
      specialInstructions: req.message
    };

    setOrders([newOrder, ...orders]);
    showToast(`Accepted offer from ${req.buyerName}! Order #${newOrder.orderNumber} created.`);
  };

  const handleDeclineBuyerRequest = (requestId: string) => {
    setBuyerRequests(buyerRequests.map(r => r.id === requestId ? { ...r, status: 'Declined' } : r));
    showToast('Offer declined');
  };

  const handleCounterOfferRequest = (request: BuyerRequest) => {
    showToast(`Counter offer dialog opened for ${request.cropName}`);
  };

  // Buyer Actions
  const handleDirectEscrowOrder = (orderDetails: any) => {
    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: orderDetails.productId,
      cropName: orderDetails.cropName,
      quantity: orderDetails.quantity,
      unit: orderDetails.unit,
      pricePerUnit: orderDetails.pricePerUnit,
      totalAmount: orderDetails.totalAmount,
      farmerId: orderDetails.farmerId,
      farmerName: orderDetails.farmerName,
      buyerId: 'buyer-1',
      buyerName: 'Priya Shah (FreshFarm Retail)',
      status: 'Confirmed',
      escrowStatus: 'Held',
      createdAt: 'Today',
      deliveryLocation: orderDetails.deliveryLocation,
      specialInstructions: orderDetails.specialInstructions
    };

    setOrders([newOrder, ...orders]);
    showToast(`Purchase order placed! ₹${orderDetails.totalAmount.toLocaleString('en-IN')} deposited safely in Escrow.`);
    navigateTo('buyer-orders');
  };

  const handleCustomRequestSubmitted = (requestDetails: any) => {
    const newReq: BuyerRequest = {
      id: `req-${Date.now()}`,
      buyerId: 'buyer-1',
      buyerName: 'Priya Shah',
      buyerCompany: 'FreshFarm Retail',
      buyerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      buyerLocation: 'Navi Mumbai',
      buyerType: 'Wholesale Retailer',
      cropName: requestDetails.cropName,
      productId: requestDetails.productId,
      requestedQuantity: requestDetails.requestedQuantity,
      unit: requestDetails.unit,
      offeredPrice: requestDetails.offeredPrice,
      totalOfferedValue: requestDetails.totalOfferedValue,
      status: 'Pending',
      createdAt: 'Just now',
      message: requestDetails.message
    };

    setBuyerRequests([newReq, ...buyerRequests]);
    showToast('Custom purchase offer transmitted directly to the farmer!');
  };

  const handleConfirmDelivery = (orderId: string) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'Delivered', escrowStatus: 'Released' };
      }
      return o;
    }));

    showToast('Delivery quality approved! Escrow payment released to farmer account.');
  };

  // Admin Actions
  const handleApproveKYC = (name: string) => {
    showToast(`KYC documents approved for ${name}. Badge granted.`);
  };

  const handleReleaseEscrowOverride = (escrowId: string) => {
    setEscrowLedger(escrowLedger.map(e => e.id === escrowId ? { ...e, status: 'Released to Farmer' } : e));
    showToast('Admin override: Escrow payment released to farmer bank account.');
  };

  // Logistics action
  const handleBookTransport = (booking: any) => {
    showToast(`Transport requested for ${booking.cropName}! Nearby driver dispatched.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] text-[#002517] font-sans antialiased selection:bg-[#9DF1C0] selection:text-[#002517]">
      
      {/* GLOBAL HEADER */}
      <Header
        currentView={currentView}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        onNavigate={navigateTo}
        onOpenAuthModal={(role, mode) => setAuthModalState({ isOpen: true, role: role || 'farmer', mode: mode || 'login' })}
        notifications={notifications}
        notificationsCount={notifications.filter(n => !n.isRead).length}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
      />

      {/* MAIN VIEW SWITCHER */}
      <main className="flex-1">
        {/* PUBLIC VIEWS */}
        {currentView === 'landing' && (
          <LandingPage
            products={products}
            marketPrices={marketPrices}
            onNavigate={navigateTo}
            onOpenAuthModal={(role, mode) => setAuthModalState({ isOpen: true, role: role || 'farmer', mode: mode || 'login' })}
          />
        )}

        {currentView === 'marketplace' && (
          <MarketplacePage
            products={products}
            initialCategory={marketplaceCategory}
            initialQuery={marketplaceQuery}
            onNavigate={navigateTo}
            onOpenAuthModal={(role) => setAuthModalState({ isOpen: true, role: role || 'buyer', mode: 'login' })}
            onQuickRequestCrop={(prod) => navigateTo('product-details', { product: prod })}
          />
        )}

        {currentView === 'product-details' && selectedProduct && (
          <ProductDetailsPage
            product={selectedProduct}
            onNavigate={navigateTo}
            onOpenAuthModal={(role) => setAuthModalState({ isOpen: true, role: role || 'buyer', mode: 'login' })}
            onOrderPlaced={handleDirectEscrowOrder}
            onRequestSubmitted={handleCustomRequestSubmitted}
          />
        )}

        {currentView === 'market-prices' && (
          <MarketPricesPage
            marketPrices={marketPrices}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'logistics' && (
          <LogisticsPage
            onNavigate={navigateTo}
            onBookTransport={handleBookTransport}
          />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorksPage
            onNavigate={navigateTo}
            onOpenAuthModal={(role, mode) => setAuthModalState({ isOpen: true, role: role || 'farmer', mode: mode || 'register' })}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onNavigate={navigateTo}
            onOpenAuthModal={() => setAuthModalState({ isOpen: true, role: 'farmer', mode: 'register' })}
          />
        )}

        {/* FARMER PORTAL VIEWS */}
        {currentView === 'farmer-dashboard' && (
          <FarmerDashboard
            products={products}
            buyerRequests={buyerRequests}
            orders={orders}
            marketPrices={marketPrices}
            onNavigate={navigateTo}
            onAcceptRequest={handleAcceptBuyerRequest}
            onDeclineRequest={handleDeclineBuyerRequest}
            onCounterOfferRequest={handleCounterOfferRequest}
          />
        )}

        {currentView === 'farmer-add-crop' && (
          <FarmerAddCrop
            onNavigate={navigateTo}
            onPublishCrop={handlePublishCrop}
          />
        )}

        {currentView === 'farmer-products' && (
          <FarmerProducts
            products={products}
            onNavigate={navigateTo}
            onToggleStatus={handleToggleProductStatus}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentView === 'farmer-buyer-requests' && (
          <FarmerBuyerRequests
            buyerRequests={buyerRequests}
            onNavigate={navigateTo}
            onAcceptRequest={handleAcceptBuyerRequest}
            onDeclineRequest={handleDeclineBuyerRequest}
            onCounterOfferRequest={handleCounterOfferRequest}
          />
        )}

        {currentView === 'farmer-orders' && (
          <FarmerOrders
            orders={orders}
            onNavigate={navigateTo}
            onUpdateOrderStatus={(id, status) => {
              setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
              showToast(`Order status updated to ${status}`);
            }}
          />
        )}

        {/* BUYER PORTAL VIEWS */}
        {currentView === 'buyer-dashboard' && (
          <BuyerDashboard
            products={products}
            buyerRequests={buyerRequests}
            orders={orders}
            marketPrices={marketPrices}
            onNavigate={navigateTo}
            onConfirmDelivery={handleConfirmDelivery}
          />
        )}

        {currentView === 'buyer-orders' && (
          <BuyerOrders
            orders={orders}
            onNavigate={navigateTo}
            onConfirmDelivery={handleConfirmDelivery}
          />
        )}

        {/* ADMIN PORTAL VIEWS */}
        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            products={products}
            orders={orders}
            marketPrices={marketPrices}
            escrowLedger={escrowLedger}
            onNavigate={navigateTo}
            onApproveKYC={handleApproveKYC}
            onReleaseEscrowOverride={handleReleaseEscrowOverride}
          />
        )}

        {/* 404 FALLBACK */}
        {![
          'landing', 'marketplace', 'product-details', 'market-prices', 'logistics', 'how-it-works', 'about',
          'farmer-dashboard', 'farmer-add-crop', 'farmer-products', 'farmer-buyer-requests', 'farmer-orders',
          'buyer-dashboard', 'buyer-orders',
          'admin-dashboard'
        ].includes(currentView) && (
          <NotFoundPage onNavigate={navigateTo} />
        )}
      </main>

      {/* GLOBAL FOOTER */}
      <Footer onNavigate={navigateTo} onOpenAuthModal={(role) => setAuthModalState({ isOpen: true, role: role || 'farmer', mode: 'register' })} />

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav
        activeRole={activeRole}
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenAuthModal={() => setAuthModalState({ isOpen: true, role: 'farmer', mode: 'login' })}
      />

      {/* NOTIFICATION DRAWER */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearNotifications}
        onNavigate={navigateTo}
      />

      {/* ROLE AUTH MODALS */}
      <AuthModals
        isOpen={authModalState.isOpen}
        initialRole={authModalState.role}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onLoginSuccess={(role) => {
          setAuthModalState({ ...authModalState, isOpen: false });
          handleRoleChange(role);
        }}
      />

      {/* TOAST SYSTEM */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
