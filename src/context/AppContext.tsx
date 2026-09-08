import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ProductListing,
  BuyerRequest,
  OrderItem,
  MandiMarketPrice,
  AdminEscrowLedger,
  AppNotification,
} from '../types';
import { useAuth } from '../auth/useAuth';
import { productsService } from '../services/products.service';
import { requestsService } from '../services/requests.service';
import { ordersService } from '../services/orders.service';
import { mandiService } from '../services/mandi.service';
import { notificationsService } from '../services/notifications.service';

export interface AppContextType {
  products: ProductListing[];
  buyerRequests: BuyerRequest[];
  orders: OrderItem[];
  marketPrices: MandiMarketPrice[];
  escrowLedger: AdminEscrowLedger[];
  notifications: AppNotification[];
  toast: { message: string; type?: 'success' | 'error' | 'info' } | null;
  notificationDrawerOpen: boolean;
  selectedProduct: ProductListing | null;
  marketplaceQuery: string;
  marketplaceCategory: string;
  isLoading: boolean;
  dataError: string | null;
  refreshData: () => Promise<void>;
  setNotificationDrawerOpen: (open: boolean) => void;
  setSelectedProduct: (p: ProductListing | null) => void;
  setMarketplaceQuery: (q: string) => void;
  setMarketplaceCategory: (c: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  handlePublishCrop: (newCropData: Partial<ProductListing>) => Promise<void>;
  handleToggleProductStatus: (id: string) => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;
  handleAcceptBuyerRequest: (requestId: string) => Promise<void>;
  handleDeclineBuyerRequest: (requestId: string) => Promise<void>;
  handleSendCounterOffer: (requestId: string, counterPrice: number, counterNote?: string) => Promise<void>;
  handleCreateOrder: (orderData: Partial<OrderItem>) => Promise<void>;
  handleUpdateOrderStatus: (orderId: string, newStatus: any) => Promise<void>;
  handleMarkAllNotificationsRead: () => Promise<void>;
  handleClearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [marketPrices, setMarketPrices] = useState<MandiMarketPrice[]>([]);
  const [escrowLedger, setEscrowLedger] = useState<AdminEscrowLedger[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductListing | null>(null);
  const [marketplaceQuery, setMarketplaceQuery] = useState('');
  const [marketplaceCategory, setMarketplaceCategory] = useState('All');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch all business modules directly from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const [prodsRes, mandiRes] = await Promise.allSettled([
        productsService.getProducts(),
        mandiService.getMandiPrices(),
      ]);

      if (prodsRes.status === 'fulfilled') {
        setProducts(prodsRes.value);
      } else {
        console.error('Products load error:', prodsRes.reason);
      }

      if (mandiRes.status === 'fulfilled') {
        setMarketPrices(mandiRes.value);
      } else {
        console.error('Mandi load error:', mandiRes.reason);
      }

      // User-specific data if logged in
      if (user?.id) {
        const [reqsRes, ordersRes, notifsRes] = await Promise.allSettled([
          requestsService.getRequests(),
          ordersService.getOrders(),
          notificationsService.getNotifications(),
        ]);

        if (reqsRes.status === 'fulfilled') setBuyerRequests(reqsRes.value);
        if (ordersRes.status === 'fulfilled') {
          setOrders(ordersRes.value);
          // Build escrow ledger view from orders
          const ledgers: AdminEscrowLedger[] = ordersRes.value.map((o) => ({
            id: `esc-${o.id}`,
            orderId: o.id,
            amount: o.totalAmount,
            farmerName: o.farmerName,
            buyerName: o.buyerName,
            status: o.escrowStatus === 'Released to Farmer' ? 'Released to Farmer' : o.escrowStatus === 'Refunded' ? 'Refunded' : 'Held in Escrow',
            createdAt: o.placedDate || 'Recent',
            disputeFlag: o.status === 'Reported',
          }));
          setEscrowLedger(ledgers);
        }
        if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value);
      }
    } catch (err: any) {
      console.error('Supabase marketplace data loading error:', err);
      setDataError(err.message || 'Failed to load live marketplace data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePublishCrop = async (newCropData: Partial<ProductListing>) => {
    if (!user?.id) {
      showToast('Authentication required to list produce.', 'error');
      return;
    }
    try {
      const res = await productsService.createProduct({
        title: newCropData.title || 'Fresh Harvest Crop',
        cropName: newCropData.cropName || 'Produce',
        category: newCropData.category || 'Vegetables',
        variety: newCropData.variety || 'Hybrid',
        grade: (newCropData.grade as any) || 'Grade A',
        pricePerUnit: newCropData.pricePerUnit || 25,
        unit: newCropData.unit || 'kg',
        quantityAvailable: newCropData.quantityAvailable || 500,
        minOrderQuantity: newCropData.minOrderQuantity || 50,
        district: newCropData.district || 'Nashik',
        state: newCropData.state || 'Maharashtra',
        village: newCropData.location || 'Farm Yard',
        harvestDate: newCropData.harvestDate || new Date().toISOString().split('T')[0],
        shelfLifeDays: newCropData.shelfLifeDays || 7,
        description: newCropData.description || 'Verified farm harvested crop.',
        images: newCropData.images && newCropData.images.length > 0 ? newCropData.images : undefined,
        organicCertified: newCropData.organicCertified || false,
      });

      if (res.error || !res.product) {
        throw new Error(res.error || 'Failed to create listing');
      }

      setProducts((prev) => [res.product!, ...prev]);
      showToast(`"${res.product.title}" published successfully to marketplace!`);
    } catch (err: any) {
      console.error('Failed to publish crop:', err);
      showToast(err.message || 'Failed to publish crop listing', 'error');
    }
  };

  const handleToggleProductStatus = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    const nextStatus = prod.status === 'Active' ? 'Paused' : 'Active';
    try {
      await productsService.updateProductStatus(id, nextStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );
      showToast(`Listing status updated to ${nextStatus}`);
    } catch (err: any) {
      console.error('Toggle status error:', err);
      showToast(err.message || 'Failed to update listing status', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productsService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Listing removed from marketplace');
    } catch (err: any) {
      console.error('Delete product error:', err);
      showToast(err.message || 'Failed to delete listing', 'error');
    }
  };

  const handleAcceptBuyerRequest = async (requestId: string) => {
    try {
      await requestsService.acceptRequest(requestId);
      setBuyerRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'Accepted' as const } : r))
      );

      const target = buyerRequests.find((r) => r.id === requestId);
      if (target) {
        showToast(`Request accepted! Initiating order for ${target.buyerName}.`);
        // Refresh orders from Supabase
        const updatedOrders = await ordersService.getOrders();
        setOrders(updatedOrders);
      }
    } catch (err: any) {
      console.error('Accept request error:', err);
      showToast(err.message || 'Failed to accept buyer request', 'error');
    }
  };

  const handleDeclineBuyerRequest = async (requestId: string) => {
    try {
      await requestsService.declineRequest(requestId);
      setBuyerRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'Declined' as const } : r))
      );
      showToast('Buyer proposal declined');
    } catch (err: any) {
      console.error('Decline request error:', err);
      showToast(err.message || 'Failed to decline request', 'error');
    }
  };

  const handleSendCounterOffer = async (requestId: string, counterPrice: number, counterNote?: string) => {
    try {
      const res = await requestsService.sendCounterOffer(requestId, counterPrice, undefined, counterNote);
      if (!res.success) {
        throw new Error(res.error || 'Failed to dispatch counter offer');
      }

      setBuyerRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'Counter Offered' as const,
                counterPrice,
                counterNote: counterNote || 'Counter offer sent by farmer',
              }
            : r
        )
      );
      showToast(`Counter offer of ₹${counterPrice} dispatched to buyer!`);
    } catch (err: any) {
      console.error('Counter offer error:', err);
      showToast(err.message || 'Failed to send counter offer', 'error');
    }
  };

  const handleCreateOrder = async (orderData: Partial<OrderItem>) => {
    if (!user?.id) {
      showToast('Authentication required to place orders.', 'error');
      return;
    }

    if (!orderData.productId) {
      showToast('Product selection is required to create order.', 'error');
      return;
    }

    try {
      const createdOrder = await ordersService.createOrder({
        productId: orderData.productId,
        quantity: orderData.quantity || 100,
        deliveryAddress: orderData.deliveryAddress,
        deliveryDistrict: orderData.buyerLocation,
        specialInstructions: orderData.specialInstructions,
      });

      setOrders((prev) => [createdOrder, ...prev]);
      showToast(`Order #${createdOrder.orderNumber} confirmed! Advance payment locked in escrow.`);
    } catch (err: any) {
      console.error('Create order error:', err);
      showToast(err.message || 'Failed to place order', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Update order status error:', err);
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err: any) {
      console.error('Mark all read error:', err);
    }
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        buyerRequests,
        orders,
        marketPrices,
        escrowLedger,
        notifications,
        toast,
        notificationDrawerOpen,
        selectedProduct,
        marketplaceQuery,
        marketplaceCategory,
        isLoading,
        dataError,
        refreshData: loadData,
        setNotificationDrawerOpen,
        setSelectedProduct,
        setMarketplaceQuery,
        setMarketplaceCategory,
        showToast,
        handlePublishCrop,
        handleToggleProductStatus,
        handleDeleteProduct,
        handleAcceptBuyerRequest,
        handleDeclineBuyerRequest,
        handleSendCounterOffer,
        handleCreateOrder,
        handleUpdateOrderStatus,
        handleMarkAllNotificationsRead,
        handleClearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an <AppProvider>');
  }
  return context;
};
