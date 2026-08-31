import React, { useState } from 'react';
import { UserRole, AppNotification } from '../../types';
import { Logo } from '../brand/Logo';
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  Sprout, 
  ShoppingBag, 
  ShieldCheck, 
  User, 
  LogOut, 
  PlusCircle,
  Truck,
  TrendingUp,
  Store,
  Layers,
  HelpCircle,
  Info
} from 'lucide-react';

interface HeaderProps {
  currentView?: string;
  onNavigate: (view: string, extra?: any) => void;
  userRole?: UserRole;
  activeRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onRoleChange?: (role: UserRole) => void;
  onOpenAuthModal: (initialRole?: UserRole, tab?: 'login' | 'register') => void;
  notifications?: AppNotification[];
  notificationsCount?: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView = 'landing',
  onNavigate,
  userRole,
  activeRole,
  onSwitchRole,
  onRoleChange,
  onOpenAuthModal,
  notifications = [],
  notificationsCount,
  onOpenNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const effectiveRole: UserRole = activeRole || userRole || 'public';
  const handleSwitch = (role: UserRole) => {
    if (onRoleChange) onRoleChange(role);
    else if (onSwitchRole) onSwitchRole(role);
  };

  const unreadCount = notificationsCount !== undefined 
    ? notificationsCount 
    : (notifications ? notifications.filter(n => !n.isRead).length : 0);

  const getRoleLabel = () => {
    switch (effectiveRole) {
      case 'farmer':
        return { label: 'Farmer Portal', icon: Sprout, color: 'text-[#0D6C45] bg-[#E6F0E8] border-[#9DF1C0]' };
      case 'buyer':
        return { label: 'Buyer Portal', icon: ShoppingBag, color: 'text-[#C2962A] bg-[#FFF8E7] border-[#FFDF9E]' };
      case 'admin':
        return { label: 'Admin Portal', icon: ShieldCheck, color: 'text-amber-800 bg-amber-50 border-amber-200' };
      default:
        return { label: 'Public View', icon: Layers, color: 'text-[#151E19] bg-white border-[#E7DDC8]' };
    }
  };

  const currentRoleInfo = getRoleLabel();
  const CurrentRoleIcon = currentRoleInfo.icon;

  const navLinks = [
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'market-prices', label: 'Mandi Prices', badge: 'Live', icon: TrendingUp },
    { id: 'logistics', label: 'AgriLogistics', icon: Truck },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#E7DDC8] transition-all">
      {/* Top Banner (Optional status bar) */}
      <div className="bg-[#002517] text-white text-[11px] py-1 px-4 text-center font-medium hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-4 mx-auto">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9DF1C0] animate-pulse" />
            <strong className="text-[#9DF1C0]">Live APMC Feed:</strong> Tomato ₹26/kg (+8.3%) | Onion ₹38/kg (+5.5%) | Wheat ₹34/kg
          </span>
          <span className="text-[#E7DDC8]/60">|</span>
          <span className="text-[#E7DDC8]/80">Zero Commission Direct Farmer Trading</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#E7DDC8]/80">
          <span>Toll-Free Helpline: 1800 233 4455</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Logo 
              variant="desktop" 
              onClick={() => onNavigate(effectiveRole === 'public' ? 'landing' : `${effectiveRole}-dashboard`)}
            />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentView === link.id
                      ? 'text-[#002517] bg-[#E6F0E8]'
                      : 'text-[#525B54] hover:text-[#002517] hover:bg-[#E6F0E8]/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.label}
                    {link.badge && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-[#0D6C45] text-white rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger for Marketplace */}
            <button
              onClick={() => onNavigate('marketplace')}
              className="hidden md:flex items-center gap-2 bg-white border border-[#C1C8C2]/60 hover:border-[#0D6C45] px-3 py-1.5 rounded-xl text-xs text-[#717973] hover:text-[#002517] transition-all shadow-xs"
            >
              <Search className="w-3.5 h-3.5 text-[#0D6C45]" />
              <span>Search crops, mandis, farmers...</span>
              <kbd className="text-[9px] bg-[#E6F0E8] text-[#525B54] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl bg-white border border-[#E7DDC8] text-[#002517] hover:bg-[#E6F0E8] transition-colors shadow-xs"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#0D6C45] border-2 border-white rounded-full animate-pulse" />
              )}
            </button>

            {/* Role Switcher & Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${currentRoleInfo.color}`}
              >
                <CurrentRoleIcon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{currentRoleInfo.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#717973]" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-[#F7F5EF] border border-[#E7DDC8] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#717973] border-b border-[#E7DDC8]">
                    Switch Portal View
                  </div>

                  <div className="py-1 space-y-1">
                    <button
                      onClick={() => {
                        handleSwitch('farmer');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        effectiveRole === 'farmer' ? 'bg-[#002517] text-white' : 'text-[#002517] hover:bg-[#E6F0E8]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-[#0D6C45]" />
                        <span>Farmer Portal</span>
                      </div>
                      {effectiveRole === 'farmer' && <span className="w-1.5 h-1.5 rounded-full bg-[#9DF1C0]" />}
                    </button>

                    <button
                      onClick={() => {
                        handleSwitch('buyer');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        effectiveRole === 'buyer' ? 'bg-[#002517] text-white' : 'text-[#002517] hover:bg-[#E6F0E8]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#C2962A]" />
                        <span>Buyer Portal</span>
                      </div>
                      {effectiveRole === 'buyer' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF9E]" />}
                    </button>

                    <button
                      onClick={() => {
                        handleSwitch('admin');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        effectiveRole === 'admin' ? 'bg-[#002517] text-white' : 'text-[#002517] hover:bg-[#E6F0E8]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Admin Portal</span>
                      </div>
                      {effectiveRole === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </button>

                    <button
                      onClick={() => {
                        handleSwitch('public');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        effectiveRole === 'public' ? 'bg-[#002517] text-white' : 'text-[#525B54] hover:bg-[#E6F0E8]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gray-500" />
                        <span>Public Marketplace</span>
                      </div>
                      {effectiveRole === 'public' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#E7DDC8]">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenAuthModal(effectiveRole === 'public' ? 'farmer' : effectiveRole, 'login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#525B54] hover:text-[#002517] hover:bg-[#E6F0E8] rounded-xl transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Account Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action CTA Button */}
            {effectiveRole === 'farmer' ? (
              <button
                onClick={() => onNavigate('farmer-add-crop')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-98"
              >
                <PlusCircle className="w-4 h-4 text-[#9DF1C0]" />
                <span>List New Crop</span>
              </button>
            ) : effectiveRole === 'buyer' ? (
              <button
                onClick={() => onNavigate('marketplace')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 text-[#FFDF9E]" />
                <span>Browse Produce</span>
              </button>
            ) : effectiveRole === 'admin' ? (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Command Center</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuthModal('farmer', 'register')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-98"
              >
                <Sprout className="w-4 h-4 text-[#9DF1C0]" />
                <span>Start Selling</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#002517] hover:bg-[#E6F0E8] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E7DDC8] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              placeholder="Search crops, mandis, farmers..."
              onFocus={() => {
                setMobileMenuOpen(false);
                onNavigate('marketplace');
              }}
              className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl pl-10 pr-4 py-2 text-xs text-[#002517] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                  currentView === link.id
                    ? 'bg-[#E6F0E8] text-[#002517]'
                    : 'text-[#525B54] hover:bg-[#F7F5EF]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <link.icon className="w-4 h-4 text-[#0D6C45]" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-[#0D6C45] text-white rounded-full">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick CTAs for Mobile Menu */}
          <div className="pt-3 border-t border-[#E7DDC8] grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthModal('farmer', 'login');
              }}
              className="bg-[#E6F0E8] text-[#002517] text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Sprout className="w-4 h-4 text-[#0D6C45]" />
              <span>Farmer Login</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthModal('buyer', 'login');
              }}
              className="bg-[#FFF8E7] text-[#C2962A] text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-[#C2962A]" />
              <span>Buyer Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
