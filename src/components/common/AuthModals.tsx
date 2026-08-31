import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { Logo } from '../brand/Logo';
import { 
  X, 
  Sprout, 
  ShoppingBag, 
  ShieldCheck, 
  Phone, 
  Lock, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  User,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  initialTab?: 'login' | 'register' | 'select-role';
  initialMode?: 'login' | 'register' | 'select-role';
  onLoginSuccess: (role: UserRole, userDetails?: any) => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  isOpen,
  onClose,
  initialRole = 'farmer',
  initialTab = 'login',
  initialMode,
  onLoginSuccess,
}) => {
  const targetTab = initialMode || initialTab || 'login';
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole === 'public' ? 'farmer' : initialRole);
  const [tab, setTab] = useState<'login' | 'register' | 'select-role'>(targetTab);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveRole(initialRole === 'public' ? 'farmer' : initialRole);
      setTab(initialMode || initialTab || 'login');
    }
  }, [isOpen, initialRole, initialTab, initialMode]);

  // Form states
  const [phone, setPhone] = useState('98231 44520');
  const [otp, setOtp] = useState('4452');
  const [email, setEmail] = useState('priya.shah@freshmart.in');
  const [password, setPassword] = useState('••••••••');
  const [adminKey, setAdminKey] = useState('agritech-admin-secure-2026');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Nashik, Maharashtra');
  const [farmSize, setFarmSize] = useState('10');
  const [companyName, setCompanyName] = useState('FreshMart Foods');
  const [buyerType, setBuyerType] = useState('Wholesaler');

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'admin') {
      setTab('login');
    } else {
      setTab('login');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole === 'farmer') {
      onLoginSuccess('farmer', {
        name: 'Rajesh Patil',
        phone: phone || '+91 98231 44520',
        location: 'Nashik, Maharashtra',
        verified: true,
      });
    } else if (activeRole === 'buyer') {
      onLoginSuccess('buyer', {
        name: 'Priya Shah',
        companyName: companyName || 'FreshMart Foods Pvt Ltd',
        phone: '+91 98200 67123',
        location: 'Vashi, Navi Mumbai',
        buyerType: 'Wholesaler'
      });
    } else if (activeRole === 'admin') {
      onLoginSuccess('admin', {
        name: 'Super Admin',
        role: 'Operations & Compliance Lead'
      });
    }
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole === 'farmer') {
      onLoginSuccess('farmer', {
        name: name || 'New Farmer Member',
        phone: phone || '+91 98000 00000',
        location: location || 'Pune, Maharashtra',
        verified: false,
      });
    } else {
      onLoginSuccess('buyer', {
        name: name || 'New Buyer Partner',
        companyName: companyName || 'Agri Enterprises',
        phone: phone || '+91 98000 00000',
        location: location || 'Mumbai, Maharashtra',
        buyerType
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-[#F7F5EF] border border-[#E7DDC8] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#717973] hover:text-[#151E19] hover:bg-[#E6F0E8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo variant="desktop" />
          </div>
          <p className="text-xs text-[#525B54] max-w-xs mx-auto">
            From Farm to Buyer. Directly, Digitally, Transparently.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-[#E6F0E8] p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('farmer')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              activeRole === 'farmer'
                ? 'bg-[#002517] text-white shadow-sm'
                : 'text-[#525B54] hover:text-[#002517]'
            }`}
          >
            <Sprout className={`w-4 h-4 ${activeRole === 'farmer' ? 'text-[#9DF1C0]' : 'text-[#0D6C45]'}`} />
            <span>Farmer / Seller</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('buyer')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              activeRole === 'buyer'
                ? 'bg-[#002517] text-white shadow-sm'
                : 'text-[#525B54] hover:text-[#002517]'
            }`}
          >
            <ShoppingBag className={`w-4 h-4 ${activeRole === 'buyer' ? 'text-[#FFDF9E]' : 'text-[#C2962A]'}`} />
            <span>Buyer / Trader</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              activeRole === 'admin'
                ? 'bg-[#002517] text-white shadow-sm'
                : 'text-[#525B54] hover:text-[#002517]'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeRole === 'admin' ? 'text-amber-400' : 'text-emerald-700'}`} />
            <span>Admin</span>
          </button>
        </div>

        {/* Tab switch for Farmer & Buyer */}
        {activeRole !== 'admin' && (
          <div className="flex border-b border-[#E7DDC8] mb-5">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
                tab === 'login'
                  ? 'border-[#002517] text-[#002517]'
                  : 'border-transparent text-[#717973] hover:text-[#151E19]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
                tab === 'register'
                  ? 'border-[#002517] text-[#002517]'
                  : 'border-transparent text-[#717973] hover:text-[#151E19]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* ROLE 1: FARMER AUTH */}
        {activeRole === 'farmer' && (
          <div>
            {tab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="bg-[#F2FCF3] border border-[#9DF1C0] p-3 rounded-xl flex items-center gap-2.5 text-xs text-[#002517]">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6C45] shrink-0" />
                  <span>Demo Farmer: <strong>Rajesh Patil</strong> (Nashik) pre-filled for instant testing.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1.5">
                    Mobile Number (किसान मोबाइल नंबर)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold text-[#717973]">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98231 44520"
                      className="w-full bg-white border border-[#C1C8C2] rounded-xl pl-12 pr-4 py-2.5 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1.5">
                    4-Digit Security PIN or OTP
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="••••"
                      maxLength={6}
                      className="w-full bg-white border border-[#C1C8C2] rounded-xl px-4 py-2.5 text-sm tracking-widest text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#002517]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#525B54]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#0D6C45]" />
                    <span>Keep me logged in</span>
                  </label>
                  <button type="button" className="text-[#0D6C45] font-semibold hover:underline">
                    Forgot PIN?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                >
                  <span>Open Farmer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">Full Name (पूरा नाम)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Jadhav"
                    className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#002517] mb-1">District / State</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Pune, Maharashtra"
                      className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#002517] mb-1">Farm Land (Acres)</label>
                    <input
                      type="number"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">Mobile Number for OTP</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98231 00000"
                    className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                    required
                  />
                </div>

                <div className="p-2.5 bg-[#E6F0E8] rounded-xl text-[11px] text-[#525B54]">
                  By registering, you get access to direct buyers, real-time APMC price benchmarks, and transport booking.
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Complete Farmer Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ROLE 2: BUYER AUTH */}
        {activeRole === 'buyer' && (
          <div>
            {tab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="bg-[#FFF8E7] border border-[#FFDF9E] p-3 rounded-xl flex items-center gap-2.5 text-xs text-[#002517]">
                  <CheckCircle2 className="w-4 h-4 text-[#C2962A] shrink-0" />
                  <span>Demo Buyer: <strong>Priya Shah (FreshMart)</strong> pre-filled for testing.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1.5">Business Email / Phone</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="buyer@freshmart.in"
                    className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3.5 py-2.5 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3.5 py-2.5 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#002517]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                >
                  <span>Open Buyer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">Company / Trade Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Metro Food Supplies"
                    className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#002517] mb-1">Buyer Type</label>
                    <select
                      value={buyerType}
                      onChange={(e) => setBuyerType(e.target.value)}
                      className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3 py-2 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                    >
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Trader">APMC Trader</option>
                      <option value="Retailer">Retail Chain</option>
                      <option value="Processor">Food Processor</option>
                      <option value="Direct Consumer">Bulk Buyer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#002517] mb-1">City / State</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Mumbai, MH"
                      className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@metro.in"
                    className="w-full bg-white border border-[#C1C8C2] rounded-xl px-3.5 py-2 text-sm text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Register as Buyer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ROLE 3: ADMIN AUTH (Restricted Access) */}
        {activeRole === 'admin' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">AgriTech Internal Security Portal</span>
                <p className="mt-0.5 text-[11px] text-amber-800">
                  Restricted to platform operations, compliance auditors, and dispute administrators. No public registration permitted.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#002517] mb-1.5">Admin Security Token / Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="agritech-admin-key"
                  className="w-full bg-white border border-[#C1C8C2] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#002517] font-mono focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Authenticate Admin Session</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
