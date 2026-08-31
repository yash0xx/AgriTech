import React, { useState } from 'react';
import { ProductListing, OrderItem, MandiMarketPrice, AdminEscrowLedger, UserRole } from '../../types';
import { 
  ShieldCheck, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  Activity, 
  Building2, 
  Lock, 
  ArrowUpRight,
  RefreshCw,
  Search,
  Sliders,
  FileCheck
} from 'lucide-react';

interface AdminDashboardProps {
  products: ProductListing[];
  orders: OrderItem[];
  marketPrices: MandiMarketPrice[];
  escrowLedger: AdminEscrowLedger[];
  onNavigate: (view: string, extra?: any) => void;
  onApproveKYC: (farmerName: string) => void;
  onReleaseEscrowOverride: (escrowId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  marketPrices,
  escrowLedger,
  onNavigate,
  onApproveKYC,
  onReleaseEscrowOverride,
}) => {
  const [kycRequests, setKycRequests] = useState([
    { id: 'kyc-1', name: 'Sanjay Deshmukh', type: 'Farmer', district: 'Ahmednagar', landRecordDoc: '7/12 Extract #4829', aadhaarVerified: true, status: 'Pending Review' },
    { id: 'kyc-2', name: 'MahaAgro Foods Pvt Ltd', type: 'Buyer', district: 'Pune', landRecordDoc: 'GSTIN: 27AABCU9603R1ZM', aadhaarVerified: true, status: 'Pending Review' },
    { id: 'kyc-3', name: 'Dattatray Shinde', type: 'Farmer', district: 'Satara', landRecordDoc: '7/12 Extract #9102', aadhaarVerified: true, status: 'Pending Review' }
  ]);

  const handleApprove = (id: string, name: string) => {
    setKycRequests(kycRequests.filter(k => k.id !== id));
    onApproveKYC(name);
  };

  const handleReject = (id: string) => {
    setKycRequests(kycRequests.filter(k => k.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Header Bar */}
      <div className="bg-[#002517] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9DF1C0] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Operations & Administration</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white">AgriTech Master Console</h1>
            <p className="text-xs text-[#C1C8C2] mt-0.5">Real-time surveillance of escrow settlements, KYC audits, and APMC market synchronizers.</p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-2 rounded-2xl text-xs">
            <span className="w-2 h-2 rounded-full bg-[#9DF1C0] animate-pulse" />
            <span className="text-white/90">24 APMC Mandi Feeds Online</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Monthly GMV Settled
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              ₹84,20,500
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last month</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Escrow Locked Value
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#0D6C45]">
              ₹14,50,000
            </div>
            <span className="text-[11px] text-[#717973] block">
              100% solvency guaranteed
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Verified Farmers
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#002517]">
              12,420
            </div>
            <span className="text-[11px] text-[#717973] block">
              Across 36 Maharashtra talukas
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E7DDC8] shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717973]">
              Active Disputes
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              0
            </div>
            <span className="text-[11px] text-[#717973] block">
              99.8% clean resolution rate
            </span>
          </div>
        </div>

        {/* 2-Column Split: KYC Audit Queue & Escrow Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: KYC VERIFICATION QUEUE */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E7DDC8] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#002517]">Pending KYC Verification Audits</h3>
                  <p className="text-xs text-[#717973]">Verify 7/12 Land Extracts & GSTIN credentials</p>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  {kycRequests.length} Pending
                </span>
              </div>

              <div className="divide-y divide-[#E7DDC8]">
                {kycRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#717973]">
                    <CheckCircle2 className="w-8 h-8 text-[#0D6C45] mx-auto mb-2 opacity-60" />
                    All KYC submissions have been verified.
                  </div>
                ) : (
                  kycRequests.map((req) => (
                    <div key={req.id} className="p-4 sm:p-5 hover:bg-[#F7F5EF]/50 transition-colors space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#002517]">{req.name}</h4>
                            <span className="text-[10px] font-bold bg-[#E6F0E8] text-[#002517] px-2 py-0.5 rounded-full">
                              {req.type}
                            </span>
                          </div>
                          <span className="text-xs text-[#717973]">{req.district} District</span>
                        </div>
                      </div>

                      <div className="p-3 bg-[#F7F5EF] rounded-2xl text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#717973]">Document Provided:</span>
                          <span className="font-bold text-[#002517]">{req.landRecordDoc}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#717973]">Aadhaar / Identity:</span>
                          <span className="font-bold text-[#0D6C45] flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5" />
                            Biometrically Verified
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleApprove(req.id, req.name)}
                          className="flex-1 bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#9DF1C0]" />
                          <span>Approve KYC & Issue Badge</span>
                        </button>

                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-2 text-[#717973] hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: ESCROW LEDGER & RECENT ORDERS */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E7DDC8] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E7DDC8] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#002517]">Escrow Deposit & Settlement Vault</h3>
                  <p className="text-xs text-[#717973]">Live digital settlement logs across Maharashtra trades</p>
                </div>
              </div>

              <div className="divide-y divide-[#E7DDC8]">
                {escrowLedger.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 hover:bg-[#F7F5EF]/50 transition-colors space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#002517] block">{item.orderId}</span>
                        <span className="text-[11px] text-[#717973]">Farmer: {item.farmerName} • Buyer: {item.buyerName}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-[#002517] block">₹{item.amount.toLocaleString('en-IN')}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          item.status === 'Held in Escrow'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {item.status === 'Held in Escrow' && (
                      <div className="pt-1">
                        <button
                          onClick={() => onReleaseEscrowOverride(item.id)}
                          className="text-[11px] font-bold text-[#0D6C45] hover:underline"
                        >
                          Manual Admin Payout Release Override →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
