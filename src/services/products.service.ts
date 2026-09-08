import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProductListing, CropCategory, CropUnit, QualityGrade, ProductStatus } from '../types';

export interface ProductFilterOptions {
  category?: string;
  cropName?: string;
  district?: string;
  search?: string;
  farmerId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  grade?: string;
  organicOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateProductInput {
  title: string;
  cropName: string;
  category: CropCategory;
  variety?: string;
  quantityAvailable: number;
  unit: CropUnit;
  pricePerUnit: number;
  grade: QualityGrade;
  minOrderQuantity?: number;
  harvestDate?: string;
  availabilityDate?: string;
  shelfLifeDays?: number;
  village?: string;
  district?: string;
  state?: string;
  description?: string;
  organicCertified?: boolean;
  images?: string[];
}

export const productsService = {
  /**
   * Fetch products with optional filtering
   */
  async getProducts(filters?: ProductFilterOptions): Promise<ProductListing[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          farmer:profiles!products_farmer_id_fkey(
            id,
            full_name,
            avatar_url,
            role,
            phone
          ),
          farmer_profile:farmer_profiles!products_farmer_id_fkey(
            farm_name,
            village,
            district,
            state,
            kyc_status,
            total_acres
          ),
          product_images(
            id,
            image_url,
            is_primary,
            sort_order
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.farmerId) {
        query = query.eq('farmer_id', filters.farmerId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status.toUpperCase());
      } else if (!filters?.farmerId) {
        // Default to active listings for public/buyer marketplace
        query = query.eq('status', 'ACTIVE');
      }

      if (filters?.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }

      if (filters?.cropName) {
        query = query.ilike('crop_name', `%${filters.cropName}%`);
      }

      if (filters?.district && filters.district !== 'All') {
        query = query.ilike('district', `%${filters.district}%`);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,crop_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.maxPrice) {
        query = query.lte('price_per_unit', filters.maxPrice);
      }

      if (filters?.minPrice) {
        query = query.gte('price_per_unit', filters.minPrice);
      }

      if (filters?.organicOnly) {
        query = query.eq('organic_certified', true);
      }

      // Pagination with safe bounds
      const page = Math.max(1, filters?.page || 1);
      const limit = Math.min(filters?.limit || 50, 100);
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products from Supabase:', error);
        throw error;
      }

      if (!data) return [];

      return data.map((p: any) => {
        // Sort product images
        const sortedImages = (p.product_images || [])
          .sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order)
          .map((img: any) => img.image_url);

        const images = sortedImages.length > 0
          ? sortedImages
          : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'];

        const farmerName = p.farmer?.full_name || 'Verified Producer';
        const farmerPhone = p.farmer?.phone || '';
        const farmName = p.farmer_profile?.farm_name || 'Green Fields Farm';
        const kycStatus = p.farmer_profile?.kyc_status === 'VERIFIED' ? 'Verified' : 'Pending';

        return {
          id: p.id,
          title: p.title,
          cropName: p.crop_name,
          category: p.category,
          variety: p.variety || 'Local / Hybrid',
          grade: p.quality_grade,
          pricePerUnit: Number(p.price_per_unit),
          unit: p.unit,
          marketBenchmarkPrice: Math.round(Number(p.price_per_unit) * 1.05),
          quantityAvailable: Number(p.quantity),
          minOrderQuantity: Number(p.min_order_quantity || 1),
          location: `${p.village ? `${p.village}, ` : ''}${p.district || 'Nashik'}, ${p.state || 'Maharashtra'}`,
          district: p.district || 'Nashik',
          state: p.state || 'Maharashtra',
          farmerId: p.farmer_id,
          farmer: {
            id: p.farmer_id,
            name: farmerName,
            avatar: p.farmer?.avatar_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
            location: `${p.village ? `${p.village}, ` : ''}${p.district || 'Nashik'}`,
            district: p.district || 'Nashik',
            state: p.state || 'Maharashtra',
            phone: farmerPhone,
            isVerified: kycStatus === 'Verified',
            kycStatus: kycStatus as 'Verified' | 'Pending',
            rating: 4.9,
            reviewCount: 28,
            completedOrders: 18,
            joinedDate: '2024',
            farmSizeAcres: p.farmer_profile?.total_acres ? Number(p.farmer_profile.total_acres) : 10,
            primaryCrops: [p.crop_name],
          },
          harvestDate: p.harvest_date || new Date().toISOString().split('T')[0],
          availabilityDate: p.availability_date || 'Immediate',
          shelfLifeDays: p.shelf_life_days || 7,
          description: p.description || '',
          images,
          status: (p.status === 'ACTIVE' ? 'Active' : p.status === 'PAUSED' ? 'Paused' : p.status === 'SOLD_OUT' ? 'Sold Out' : 'Draft') as ProductStatus,
          viewsCount: p.views_count || 0,
          requestsCount: p.requests_count || 0,
          featured: Boolean(p.featured),
          organicCertified: Boolean(p.organic_certified),
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        };
      });
    } catch (err) {
      console.error('productsService.getProducts failed:', err);
      throw err;
    }
  },

  /**
   * Fetch single product by ID
   */
  async getProductById(id: string): Promise<ProductListing | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data: p, error } = await supabase
        .from('products')
        .select(`
          *,
          farmer:profiles!products_farmer_id_fkey(
            id,
            full_name,
            avatar_url,
            role,
            phone
          ),
          farmer_profile:farmer_profiles!products_farmer_id_fkey(
            farm_name,
            village,
            district,
            state,
            kyc_status,
            total_acres
          ),
          product_images(
            id,
            image_url,
            is_primary,
            sort_order
          )
        `)
        .eq('id', id)
        .single();

      if (error || !p) {
        return null;
      }

      const sortedImages = (p.product_images || [])
        .sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order)
        .map((img: any) => img.image_url);

      const images = sortedImages.length > 0
        ? sortedImages
        : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'];

      return {
        id: p.id,
        title: p.title,
        cropName: p.crop_name,
        category: p.category,
        variety: p.variety || 'Hybrid',
        grade: p.quality_grade,
        pricePerUnit: Number(p.price_per_unit),
        unit: p.unit,
        marketBenchmarkPrice: Math.round(Number(p.price_per_unit) * 1.05),
        quantityAvailable: Number(p.quantity),
        minOrderQuantity: Number(p.min_order_quantity || 1),
        location: `${p.village ? `${p.village}, ` : ''}${p.district || 'Nashik'}, ${p.state || 'Maharashtra'}`,
        district: p.district || 'Nashik',
        state: p.state || 'Maharashtra',
        farmerId: p.farmer_id,
        farmer: {
          id: p.farmer_id,
          name: p.farmer?.full_name || 'Verified Producer',
          avatar: p.farmer?.avatar_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
          location: `${p.village ? `${p.village}, ` : ''}${p.district || 'Nashik'}`,
          district: p.district || 'Nashik',
          state: p.state || 'Maharashtra',
          phone: p.farmer?.phone || '',
          isVerified: p.farmer_profile?.kyc_status === 'VERIFIED',
          kycStatus: p.farmer_profile?.kyc_status === 'VERIFIED' ? 'Verified' : 'Pending',
          rating: 4.9,
          reviewCount: 28,
          completedOrders: 18,
          joinedDate: '2024',
          farmSizeAcres: p.farmer_profile?.total_acres ? Number(p.farmer_profile.total_acres) : 10,
          primaryCrops: [p.crop_name],
        },
        harvestDate: p.harvest_date || new Date().toISOString().split('T')[0],
        availabilityDate: p.availability_date || 'Immediate',
        shelfLifeDays: p.shelf_life_days || 7,
        description: p.description || '',
        images,
        status: (p.status === 'ACTIVE' ? 'Active' : p.status === 'PAUSED' ? 'Paused' : 'Draft') as ProductStatus,
        viewsCount: p.views_count || 0,
        requestsCount: p.requests_count || 0,
        featured: Boolean(p.featured),
        organicCertified: Boolean(p.organic_certified),
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    } catch (err) {
      console.error('productsService.getProductById failed:', err);
      return null;
    }
  },

  /**
   * Create a new product listing (Farmer authenticated)
   */
  async createProduct(input: CreateProductInput): Promise<{ product?: ProductListing; error?: string }> {
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        return { error: 'Authentication required. Please sign in to create listings.' };
      }

      const farmerId = userData.user.id;

      // Insert product into Supabase products table
      const { data: newProd, error: insertErr } = await supabase
        .from('products')
        .insert({
          farmer_id: farmerId,
          title: input.title.trim(),
          crop_name: input.cropName.trim(),
          category: input.category,
          variety: input.variety?.trim() || null,
          quantity: input.quantityAvailable,
          unit: input.unit,
          price_per_unit: input.pricePerUnit,
          quality_grade: input.grade,
          min_order_quantity: input.minOrderQuantity || 1,
          harvest_date: input.harvestDate || null,
          availability_date: input.availabilityDate || 'Immediate',
          shelf_life_days: input.shelfLifeDays || 7,
          village: input.village?.trim() || null,
          district: input.district?.trim() || 'Nashik',
          state: input.state?.trim() || 'Maharashtra',
          description: input.description?.trim() || null,
          organic_certified: Boolean(input.organicCertified),
          status: 'ACTIVE',
        })
        .select('*')
        .single();

      if (insertErr || !newProd) {
        return { error: insertErr?.message || 'Failed to create product listing.' };
      }

      // Add product images to product_images table if provided
      if (input.images && input.images.length > 0) {
        const imageRows = input.images.map((url, idx) => ({
          product_id: newProd.id,
          image_url: url,
          is_primary: idx === 0,
          sort_order: idx,
        }));

        const { error: imgErr } = await supabase.from('product_images').insert(imageRows);
        if (imgErr) {
          console.warn('Could not insert product images:', imgErr);
        }
      }

      const fullProduct = await this.getProductById(newProd.id);
      return { product: fullProduct || undefined };
    } catch (err: any) {
      return { error: err.message || 'Unexpected error creating product.' };
    }
  },

  /**
   * Update existing product listing (Owner / Admin authenticated)
   */
  async updateProduct(id: string, updates: Partial<CreateProductInput>): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.cropName !== undefined) payload.crop_name = updates.cropName;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.variety !== undefined) payload.variety = updates.variety;
      if (updates.quantityAvailable !== undefined) payload.quantity = updates.quantityAvailable;
      if (updates.unit !== undefined) payload.unit = updates.unit;
      if (updates.pricePerUnit !== undefined) payload.price_per_unit = updates.pricePerUnit;
      if (updates.grade !== undefined) payload.quality_grade = updates.grade;
      if (updates.minOrderQuantity !== undefined) payload.min_order_quantity = updates.minOrderQuantity;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.district !== undefined) payload.district = updates.district;
      if (updates.organicCertified !== undefined) payload.organic_certified = updates.organicCertified;

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update product.' };
    }
  },

  /**
   * Update status of product (e.g. ACTIVE, PAUSED, SOLD_OUT)
   */
  async updateProductStatus(id: string, status: 'Active' | 'Paused' | 'Draft' | 'Sold Out'): Promise<{ success: boolean; error?: string }> {
    try {
      const statusMap: Record<string, string> = {
        Active: 'ACTIVE',
        Paused: 'PAUSED',
        Draft: 'DRAFT',
        'Sold Out': 'SOLD_OUT',
      };

      const dbStatus = statusMap[status] || 'ACTIVE';

      const { error } = await supabase
        .from('products')
        .update({ status: dbStatus })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update listing status.' };
    }
  },

  /**
   * Delete product (Owner only)
   */
  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete listing.' };
    }
  },
};
