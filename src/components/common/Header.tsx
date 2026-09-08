import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole, AppNotification } from '../../types';
import { Logo } from '../brand/Logo';
import { useAuth } from '../../auth/useAuth';
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
  HelpCircle,
  Info,
  Users
} from 'lucide-react';

interface HeaderProps {
  onNavigate?: (view: string, extra?: any) => void;
  notifications?: AppNotification[];
  notificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate: propNavigate,
  notifications = [],
  notificationsCount,
  onOpenNotifications,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, role, teamMember, signOut, isAuthenticated } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    if (propNavigate) propNavigate(path);
  };

  const unreadCount = notificationsCount !== undefined
    ? notificationsCount
    : (notifications ? notifications.filter(n => !n.isRead).length : 0);

  const getRoleLabel = () => {
    switch (role) {
      case 'FARMER':
        return { label: 'Farmer Portal', icon: Sprout, color: 'text-[#0D6C45] bg-[#E6F0E8] border-[#9DF1C0]' };
      case 'SELLER':
        return { label: 'Seller Portal', icon: Store, color: 'text-indigo-800 bg-indigo-50 border-indigo-200' };
      case 'BUYER':
        return { label: 'Buyer Portal', icon: ShoppingBag, color: 'text-[#C2962A] bg-[#FFF8E7] border-[#FFDF9E]' };
      case 'ADMIN':
        return { label: 'Admin Portal', icon: ShieldCheck, color: 'text-amber-800 bg-amber-50 border-amber-200' };
      default:
        return { label: 'AgriTech Portal', icon: Sprout, color: 'text-[#151E19] bg-white border-[#E7DDC8]' };
    }
  };

  const currentRoleInfo = getRoleLabel();
  const CurrentRoleIcon = currentRoleInfo.icon;

  const navLinks = [
    { path: '/marketplace', label: 'Marketplace', icon: Store },
    { path: '/market-prices', label: 'Mandi Prices', badge: 'Live', icon: TrendingUp },
    { path: '/logistics', label: 'AgriLogistics', icon: Truck },
    { path: '/how-it-works', label: 'How It Works', icon: HelpCircle },
    { path: '/about', label: 'About', icon: Info },
  ];

  const getHomeRoute = () => {
    if (role === 'FARMER') return '/farmer';
    if (role === 'SELLER') return '/seller';
    if (role === 'BUYER') return '/buyer';
    if (role === 'ADMIN') return '/admin';
    return '/login';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#E7DDC8] transition-all">
      {/* Top Ticker Bar */}
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
              onClick={() => handleNav(getHomeRoute())}
            />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNav(link.path)}
                    className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
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
                );
              })}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger for Marketplace */}
            <button
              onClick={() => handleNav('/marketplace')}
              className="hidden md:flex items-center gap-2 bg-white border border-[#C1C8C2]/60 hover:border-[#0D6C45] px-3 py-1.5 rounded-xl text-xs text-[#717973] hover:text-[#002517] transition-all shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#0D6C45]" />
              <span>Search crops, mandis, farmers...</span>
              <kbd className="text-[9px] bg-[#E6F0E8] text-[#525B54] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Notification Bell */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-xl bg-white border border-[#E7DDC8] text-[#002517] hover:bg-[#E6F0E8] transition-colors shadow-xs cursor-pointer"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#0D6C45] border-2 border-white rounded-full animate-pulse" />
                )}
              </button>
            )}

            {/* User Profile & Account Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${currentRoleInfo.color}`}
                >
                  <CurrentRoleIcon className="w-4 h-4 shrink-0" />
                  <div className="text-left hidden sm:block">
                    <span className="block font-bold leading-tight">{profile?.fullName || 'User'}</span>
                    <span className="text-[10px] opacity-75 font-normal">{currentRoleInfo.label}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#717973]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-[#F7F5EF] border border-[#E7DDC8] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-[#E7DDC8]">
                      <div className="text-xs font-bold text-[#002517]">{profile?.fullName}</div>
                      <div className="text-[11px] text-[#717973] truncate">{profile?.phone || role}</div>
                      {teamMember && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                          <span>Team: {teamMember.teamRole}</span>
                        </div>
                      )}
                    </div>

                    <div className="py-1 space-y-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNav(getHomeRoute());
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#002517] hover:bg-[#E6F0E8] transition-colors cursor-pointer"
                      >
                        <CurrentRoleIcon className="w-4 h-4 text-[#0D6C45]" />
                        <span>My Dashboard</span>
                      </button>

                      {role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleNav('/admin/team');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-900 hover:bg-purple-100 transition-colors cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-purple-700" />
                          <span>Team Management (6 Members)</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E7DDC8]">
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await signOut();
                          navigate('/login', { replace: true });
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNav('/login')}
                className="inline-flex items-center gap-1.5 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <User className="w-4 h-4 text-[#9DF1C0]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Quick Action Button */}
            {role === 'FARMER' ? (
              <button
                onClick={() => handleNav('/farmer/products/new')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#9DF1C0]" />
                <span>List New Crop</span>
              </button>
            ) : role === 'SELLER' ? (
              <button
                onClick={() => handleNav('/seller/products/new')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-indigo-300" />
                <span>List Produce</span>
              </button>
            ) : role === 'BUYER' ? (
              <button
                onClick={() => handleNav('/marketplace')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#FFDF9E]" />
                <span>Browse Produce</span>
              </button>
            ) : role === 'ADMIN' ? (
              <button
                onClick={() => handleNav('/admin/team')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#002517] hover:bg-[#123B2A] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Manage Team</span>
              </button>
            ) : null}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#002517] hover:bg-[#E6F0E8] transition-colors cursor-pointer"
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
                handleNav('/marketplace');
              }}
              className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl pl-10 pr-4 py-2 text-xs text-[#002517] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  handleNav(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                  location.pathname === link.path
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
          <div className="pt-3 border-t border-[#E7DDC8]">
            {isAuthenticated ? (
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await signOut();
                  navigate('/login', { replace: true });
                }}
                className="w-full bg-red-50 text-red-700 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({profile?.fullName})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNav('/login');
                }}
                className="w-full bg-[#002517] text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <User className="w-4 h-4 text-[#9DF1C0]" />
                <span>Sign In to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
