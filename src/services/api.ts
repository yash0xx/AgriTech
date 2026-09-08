import { productsService } from './products.service';
import { mandiService } from './mandi.service';
import { requestsService } from './requests.service';
import { ordersService } from './orders.service';
import { notificationsService } from './notifications.service';
import { logisticsService } from './logistics.service';
import { disputesService } from './disputes.service';
import { kycService } from './kyc.service';
import { adminService } from './admin.service';
import {
  ProductListing,
  BuyerRequest,
  OrderItem,
  MandiMarketPrice,
  AppNotification,
} from '../types';

export const api = {
  // Products
  async getProducts(): Promise<ProductListing[]> {
    return productsService.getProducts();
  },

  async createProduct(product: Partial<ProductListing>): Promise<boolean> {
    try {
      await productsService.createProduct({
        title: product.title || 'Fresh Harvest Produce',
        cropName: product.cropName || 'Produce',
        category: product.category || 'Vegetables',
        variety: product.variety,
        grade: (product.grade as any) || 'Grade A',
        pricePerUnit: product.pricePerUnit || 20,
        unit: product.unit || 'kg',
        quantityAvailable: product.quantityAvailable || 100,
        minOrderQuantity: product.minOrderQuantity || 10,
        district: product.district || 'Nashik',
        state: product.state || 'Maharashtra',
        village: product.location,
        harvestDate: product.harvestDate,
        shelfLifeDays: product.shelfLifeDays,
        description: product.description,
        organicCertified: product.organicCertified,
      });
      return true;
    } catch (e) {
      console.error('API createProduct error:', e);
      return false;
    }
  },

  // Mandi Prices
  async getMandiPrices(): Promise<MandiMarketPrice[]> {
    return mandiService.getMandiPrices();
  },

  // Buyer Requests
  async getBuyerRequests(): Promise<BuyerRequest[]> {
    return requestsService.getRequests();
  },

  // Orders
  async getOrders(): Promise<OrderItem[]> {
    return ordersService.getOrders();
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    return notificationsService.getNotifications();
  },

  // Logistics
  async getLogisticsQuote(params: any) {
    return logisticsService.getQuote(params);
  },

  // Disputes
  async getDisputes() {
    return disputesService.getDisputes();
  },

  // KYC
  async getOwnKyc() {
    return kycService.getOwnKyc();
  },

  // Admin
  async getAdminStats() {
    return adminService.getDashboardStats();
  },
};

export {
  productsService,
  mandiService,
  requestsService,
  ordersService,
  notificationsService,
  logisticsService,
  disputesService,
  kycService,
  adminService,
};
