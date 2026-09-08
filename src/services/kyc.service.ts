import { supabase } from '../lib/supabase';

export interface KycRecord {
  id: string;
  userId: string;
  userName?: string;
  userRole?: string;
  documentType: string;
  documentNumberMasked: string;
  documentUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mask document number for privacy (e.g. "XXXX-XXXX-1234")
 */
export function maskDocumentNumber(docNum: string): string {
  if (!docNum || docNum.length <= 4) return '****';
  const visible = docNum.slice(-4);
  return `${'*'.repeat(Math.max(4, docNum.length - 4))}${visible}`;
}

function transformKyc(row: any): KycRecord {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.profile?.full_name || 'Verified User',
    userRole: row.profile?.role || 'FARMER',
    documentType: row.document_type,
    documentNumberMasked: maskDocumentNumber(row.document_number),
    documentUrl: row.document_url || undefined,
    status: row.status,
    rejectionReason: row.rejection_reason || undefined,
    verifiedBy: row.verified_by || undefined,
    verifiedByName: row.verifier?.full_name || undefined,
    verifiedAt: row.verified_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const kycService = {
  /**
   * Fetch current user's KYC record
   */
  async getOwnKyc(): Promise<KycRecord | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from('kyc_records')
      .select(`
        *,
        profile:profiles!user_id(full_name, role),
        verifier:profiles!verified_by(full_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Failed to get own KYC:', error);
      throw new Error(`Failed to get KYC status: ${error.message}`);
    }

    return data ? transformKyc(data) : null;
  },

  /**
   * Submit or re-submit KYC documents
   */
  async submitKyc(params: {
    documentType: string;
    documentNumber: string;
    documentUrl?: string;
  }): Promise<KycRecord> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      throw new Error('Authentication required to submit KYC');
    }

    // Check if an existing KYC record exists
    const existing = await this.getOwnKyc();

    if (existing && (existing.status === 'PENDING' || existing.status === 'REJECTED')) {
      // Update existing record
      const { data, error } = await supabase
        .from('kyc_records')
        .update({
          document_type: params.documentType,
          document_number: params.documentNumber,
          document_url: params.documentUrl || null,
          status: 'PENDING',
          rejection_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select(`
          *,
          profile:profiles!user_id(full_name, role)
        `)
        .single();

      if (error || !data) {
        throw new Error(`Failed to update KYC: ${error?.message}`);
      }
      return transformKyc(data);
    }

    // Otherwise insert new record
    const { data, error } = await supabase
      .from('kyc_records')
      .insert({
        user_id: userId,
        document_type: params.documentType,
        document_number: params.documentNumber,
        document_url: params.documentUrl || null,
        status: 'PENDING',
      })
      .select(`
        *,
        profile:profiles!user_id(full_name, role)
      `)
      .single();

    if (error || !data) {
      throw new Error(`Failed to submit KYC: ${error?.message}`);
    }

    return transformKyc(data);
  },

  /**
   * Admin: fetch all KYC records
   */
  async getAllKyc(status?: string): Promise<KycRecord[]> {
    let query = supabase
      .from('kyc_records')
      .select(`
        *,
        profile:profiles!user_id(full_name, role),
        verifier:profiles!verified_by(full_name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to get KYC records:', error);
      throw new Error(`Failed to fetch KYC records: ${error.message}`);
    }

    return (data || []).map(transformKyc);
  },

  /**
   * Admin: verify KYC record and update profile
   */
  async verifyKyc(recordId: string): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const adminId = sessionData.session?.user?.id;

    const { data: record, error: getErr } = await supabase
      .from('kyc_records')
      .select('user_id')
      .eq('id', recordId)
      .single();

    if (getErr || !record) {
      throw new Error('KYC record not found');
    }

    const { error } = await supabase
      .from('kyc_records')
      .update({
        status: 'VERIFIED',
        verified_by: adminId || null,
        verified_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq('id', recordId);

    if (error) {
      throw new Error(`Failed to verify KYC: ${error.message}`);
    }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: record.user_id,
      title: 'KYC Verified Successfully',
      message: 'Your compliance and identification documents have been verified by AgriTech.',
      type: 'KYC',
      reference_id: recordId,
    });
  },

  /**
   * Admin: reject KYC record with mandatory reason
   */
  async rejectKyc(recordId: string, rejectionReason: string): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const adminId = sessionData.session?.user?.id;

    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('Rejection reason is required');
    }

    const { data: record, error: getErr } = await supabase
      .from('kyc_records')
      .select('user_id')
      .eq('id', recordId)
      .single();

    if (getErr || !record) {
      throw new Error('KYC record not found');
    }

    const { error } = await supabase
      .from('kyc_records')
      .update({
        status: 'REJECTED',
        rejection_reason: rejectionReason,
        verified_by: adminId || null,
        verified_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    if (error) {
      throw new Error(`Failed to reject KYC: ${error.message}`);
    }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: record.user_id,
      title: 'KYC Verification Update',
      message: `Your KYC document submission was rejected: ${rejectionReason}. Please re-submit valid documents.`,
      type: 'KYC',
      reference_id: recordId,
    });
  },
};
