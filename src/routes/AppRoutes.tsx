import React from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useApp } from '../context/AppContext';

// Layouts & Route Guards
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { RoleRoute } from '../auth/RoleRoute';

// Auth Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { SuspendedPage } from '../pages/SuspendedPage';
import { TeamManagementPage } from '../pages/admin/TeamManagementPage';

// Views
import { FarmerDashboard } from '../views/farmer/FarmerDashboard';
import { FarmerProducts } from '../views/farmer/FarmerProducts';
import { FarmerAddCrop } from '../views/farmer/FarmerAddCrop';
import { FarmerBuyerRequests } from '../views/farmer/FarmerBuyerRequests';
import { FarmerOrders } from '../views/farmer/FarmerOrders';

import { SellerDashboard } from '../views/seller/SellerDashboard';
import { SellerProducts } from '../views/seller/SellerProducts';
import { SellerAddProduct } from '../views/seller/SellerAddProduct';
import { SellerBuyerRequests } from '../views/seller/SellerBuyerRequests';
import { SellerOrders } from '../views/seller/SellerOrders';

import { BuyerDashboard } from '../views/buyer/BuyerDashboard';
import { BuyerOrders } from '../views/buyer/BuyerOrders';

import { AdminDashboard } from '../views/admin/AdminDashboard';

import { MarketplacePage } from '../views/public/MarketplacePage';
import { ProductDetailsPage } from '../views/public/ProductDetailsPage';
import { MarketPricesPage } from '../views/public/MarketPricesPage';
import { LogisticsPage } from '../views/public/LogisticsPage';
import { HowItWorksPage } from '../views/public/HowItWorksPage';
import { AboutPage } from '../views/public/AboutPage';
import { NotFoundPage } from '../views/public/NotFoundPage';

// Helper to map legacy view identifiers to React Router paths
export const mapLegacyViewToPath = (view: string, extra?: any): string => {
  switch (view) {
    case 'farmer-dashboard': return '/farmer';
    case 'farmer-products': return '/farmer/products';
    case 'farmer-add-crop': return '/farmer/products/new';
    case 'farmer-buyer-requests': return '/farmer/requests';
    case 'farmer-orders': return '/farmer/orders';
    case 'seller-dashboard': return '/seller';
    case 'seller-products': return '/seller/products';
    case 'seller-products-new': return '/seller/products/new';
    case 'seller-add-product': return '/seller/products/new';
    case 'seller-requests': return '/seller/requests';
    case 'seller-orders': return '/seller/orders';
    case 'buyer-dashboard': return '/buyer';
    case 'buyer-orders': return '/buyer/orders';
    case 'admin-dashboard': return '/admin';
    case 'admin-team': return '/admin/team';
    case 'marketplace': return '/marketplace';
    case 'product-details': return extra?.product?.id ? `/products/${extra.product.id}` : '/marketplace';
    case 'market-prices': return '/market-prices';
    case 'logistics': return '/logistics';
    case 'how-it-works': return '/how-it-works';
    case 'about': return '/about';
    case 'landing': return '/';
    default: return view.startsWith('/') ? view : `/${view}`;
  }
};

// Root Redirect Component
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'FARMER') return <Navigate to="/farmer" replace />;
  if (role === 'SELLER') return <Navigate to="/seller" replace />;
  if (role === 'BUYER') return <Navigate to="/buyer" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
};

// --- View Wrappers connecting useApp & useNavigate ---

const FarmerDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    if (extra?.product) app.setSelectedProduct(extra.product);
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <FarmerDashboard
      products={app.products}
      buyerRequests={app.buyerRequests}
      orders={app.orders}
      marketPrices={app.marketPrices}
      onNavigate={handleNav}
      onAcceptRequest={app.handleAcceptBuyerRequest}
      onDeclineRequest={app.handleDeclineBuyerRequest}
      onCounterOfferRequest={(req) => handleNav('farmer-buyer-requests')}
    />
  );
};

const FarmerProductsView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    if (extra?.product) app.setSelectedProduct(extra.product);
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <FarmerProducts
      products={app.products}
      onNavigate={handleNav}
      onToggleStatus={app.handleToggleProductStatus}
      onDeleteProduct={app.handleDeleteProduct}
    />
  );
};

const FarmerAddCropView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <FarmerAddCrop
      onPublishCrop={(crop) => {
        app.handlePublishCrop(crop);
        navigate('/farmer/products');
      }}
      onNavigate={handleNav}
    />
  );
};

const FarmerBuyerRequestsView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <FarmerBuyerRequests
      buyerRequests={app.buyerRequests}
      onNavigate={handleNav}
      onAcceptRequest={app.handleAcceptBuyerRequest}
      onDeclineRequest={app.handleDeclineBuyerRequest}
      onCounterOfferRequest={(req, price, note) => {
        app.handleSendCounterOffer(req.id, price, note);
      }}
    />
  );
};

const FarmerOrdersView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <FarmerOrders
      orders={app.orders}
      onNavigate={handleNav}
      onUpdateStatus={app.handleUpdateOrderStatus}
    />
  );
};

const SellerDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    if (extra?.product) app.setSelectedProduct(extra.product);
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <SellerDashboard
      products={app.products}
      buyerRequests={app.buyerRequests}
      orders={app.orders}
      marketPrices={app.marketPrices}
      onNavigate={handleNav}
      onAcceptRequest={app.handleAcceptBuyerRequest}
      onDeclineRequest={app.handleDeclineBuyerRequest}
      onCounterOfferRequest={(req) => handleNav('seller-requests')}
    />
  );
};

const SellerProductsView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    if (extra?.product) app.setSelectedProduct(extra.product);
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <SellerProducts
      products={app.products}
      onNavigate={handleNav}
      onToggleStatus={app.handleToggleProductStatus}
      onDeleteProduct={app.handleDeleteProduct}
    />
  );
};

const SellerAddProductView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <SellerAddProduct
      onPublishProduct={(prod) => {
        app.handlePublishCrop(prod);
        navigate('/seller/products');
      }}
      onNavigate={handleNav}
    />
  );
};

const SellerBuyerRequestsView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <SellerBuyerRequests
      buyerRequests={app.buyerRequests}
      onNavigate={handleNav}
      onAcceptRequest={app.handleAcceptBuyerRequest}
      onDeclineRequest={app.handleDeclineBuyerRequest}
      onCounterOfferRequest={(req, price, note) => {
        app.handleSendCounterOffer(req.id, price, note);
      }}
    />
  );
};

const SellerOrdersView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <SellerOrders
      orders={app.orders}
      onNavigate={handleNav}
      onUpdateOrderStatus={app.handleUpdateOrderStatus}
    />
  );
};

const BuyerDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    if (extra?.product) app.setSelectedProduct(extra.product);
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <BuyerDashboard
      products={app.products}
      orders={app.orders}
      buyerRequests={app.buyerRequests}
      marketPrices={app.marketPrices}
      onNavigate={handleNav}
    />
  );
};

const BuyerOrdersView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <BuyerOrders
      orders={app.orders}
      onNavigate={handleNav}
      onUpdateStatus={app.handleUpdateOrderStatus}
    />
  );
};

const AdminDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <AdminDashboard
      products={app.products}
      orders={app.orders}
      escrowLedger={app.escrowLedger}
      onNavigate={handleNav}
      onUpdateOrderStatus={app.handleUpdateOrderStatus}
      onToggleProductStatus={app.handleToggleProductStatus}
    />
  );
};

const MarketplacePageView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    if (extra?.product) app.setSelectedProduct(extra.product);
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <MarketplacePage
      products={app.products}
      onNavigate={handleNav}
      onSelectProduct={(p) => {
        app.setSelectedProduct(p);
        navigate(`/products/${p.id}`);
      }}
      initialCategory={app.marketplaceCategory}
      initialQuery={app.marketplaceQuery}
    />
  );
};

const ProductDetailsPageView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const app = useApp();
  const product = app.products.find((p) => p.id === id) || app.selectedProduct || app.products[0];

  const handleNav = (view: string, extra?: any) => {
    navigate(mapLegacyViewToPath(view, extra));
  };

  return (
    <ProductDetailsPage
      product={product}
      onNavigate={handleNav}
      onBuyNow={(prod, qty) => {
        app.handleCreateOrder({
          productId: prod.id,
          cropName: prod.cropName,
          farmerId: prod.farmerId,
          farmerName: prod.farmer?.name,
          quantity: qty,
          unit: prod.unit,
          pricePerUnit: prod.pricePerUnit,
          totalAmount: prod.pricePerUnit * qty,
        });
        navigate('/buyer/orders');
      }}
      onRequestQuote={(prod, qty, price, note) => {
        app.showToast('Quotation request sent to farmer!');
        navigate('/buyer');
      }}
    />
  );
};

const MarketPricesPageView: React.FC = () => {
  const navigate = useNavigate();
  const app = useApp();
  const handleNav = (view: string, extra?: any) => {
    navigate(mapLegacyViewToPath(view, extra));
  };

  return <MarketPricesPage marketPrices={app.marketPrices} onNavigate={handleNav} />;
};

const LogisticsPageView: React.FC = () => {
  const navigate = useNavigate();
  const handleNav = (view: string, extra?: any) => navigate(mapLegacyViewToPath(view, extra));
  return <LogisticsPage onNavigate={handleNav} />;
};

const HowItWorksPageView: React.FC = () => {
  const navigate = useNavigate();
  const handleNav = (view: string, extra?: any) => navigate(mapLegacyViewToPath(view, extra));
  return <HowItWorksPage onNavigate={handleNav} />;
};

const AboutPageView: React.FC = () => {
  const navigate = useNavigate();
  const handleNav = (view: string, extra?: any) => navigate(mapLegacyViewToPath(view, extra));
  return <AboutPage onNavigate={handleNav} />;
};

const NotFoundPageView: React.FC = () => {
  const navigate = useNavigate();
  const handleNav = (view: string, extra?: any) => navigate(mapLegacyViewToPath(view, extra));
  return <NotFoundPage onNavigate={handleNav} />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Public Routes (AuthLayout) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/suspended" element={<SuspendedPage />} />
      </Route>

      {/* Authenticated Application Routes (ProtectedRoute + AppLayout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Root redirect based on role */}
          <Route path="/" element={<RootRedirect />} />

          {/* Farmer Protected Routes */}
          <Route element={<RoleRoute allowedRoles={['FARMER']} />}>
            <Route path="/farmer" element={<FarmerDashboardView />} />
            <Route path="/farmer/products" element={<FarmerProductsView />} />
            <Route path="/farmer/products/new" element={<FarmerAddCropView />} />
            <Route path="/farmer/requests" element={<FarmerBuyerRequestsView />} />
            <Route path="/farmer/orders" element={<FarmerOrdersView />} />
          </Route>

          {/* Seller Protected Routes */}
          <Route element={<RoleRoute allowedRoles={['SELLER']} />}>
            <Route path="/seller" element={<SellerDashboardView />} />
            <Route path="/seller/products" element={<SellerProductsView />} />
            <Route path="/seller/products/new" element={<SellerAddProductView />} />
            <Route path="/seller/requests" element={<SellerBuyerRequestsView />} />
            <Route path="/seller/orders" element={<SellerOrdersView />} />
          </Route>

          {/* Buyer Protected Routes */}
          <Route element={<RoleRoute allowedRoles={['BUYER']} />}>
            <Route path="/buyer" element={<BuyerDashboardView />} />
            <Route path="/buyer/orders" element={<BuyerOrdersView />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboardView />} />
            <Route element={<RoleRoute allowedRoles={['ADMIN']} requireTeam={true} />}>
              <Route path="/admin/team" element={<TeamManagementPage />} />
            </Route>
          </Route>

          {/* Common Authenticated Services */}
          <Route path="/marketplace" element={<MarketplacePageView />} />
          <Route path="/products/:id" element={<ProductDetailsPageView />} />
          <Route path="/market-prices" element={<MarketPricesPageView />} />
          <Route path="/logistics" element={<LogisticsPageView />} />
          <Route path="/how-it-works" element={<HowItWorksPageView />} />
          <Route path="/about" element={<AboutPageView />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPageView />} />
        </Route>
      </Route>
    </Routes>
  );
};
