import React from 'react';
import { UserRole } from '../../types';
import { 
  Home, 
  Store, 
  TrendingUp, 
  PlusCircle, 
  ShoppingBag, 
  Truck, 
  LayoutDashboard, 
  User, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole?: UserRole;
  activeRole?: UserRole;
  onOpenAuthModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  userRole,
  activeRole,
  onOpenAuthModal = () => {},
}) => {
  const effectiveRole = activeRole || userRole || 'public';

  if (effectiveRole === 'farmer') {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7DDC8] px-2 py-1 shadow-lg flex items-center justify-around">
        <button
          onClick={() => onNavigate('farmer-dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'farmer-dashboard' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('farmer-products')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'farmer-products' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>My Crops</span>
        </button>

        <button
          onClick={() => onNavigate('farmer-add-crop')}
          className="flex flex-col items-center justify-center -mt-4"
        >
          <div className="w-12 h-12 rounded-full bg-[#002517] text-white flex items-center justify-center shadow-lg border-2 border-white active:scale-95">
            <PlusCircle className="w-6 h-6 text-[#9DF1C0]" />
          </div>
          <span className="text-[10px] font-bold text-[#002517] mt-0.5">Post Crop</span>
        </button>

        <button
          onClick={() => onNavigate('farmer-buyer-requests')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'farmer-buyer-requests' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>Requests</span>
        </button>

        <button
          onClick={() => onNavigate('market-prices')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'market-prices' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Mandi Live</span>
        </button>
      </nav>
    );
  }

  if (effectiveRole === 'buyer') {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7DDC8] px-2 py-1 shadow-lg flex items-center justify-around">
        <button
          onClick={() => onNavigate('buyer-dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'buyer-dashboard' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('marketplace')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'marketplace' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Browse</span>
        </button>

        <button
          onClick={() => onNavigate('buyer-orders')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'buyer-orders' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => onNavigate('market-prices')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'market-prices' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Mandi Rates</span>
        </button>

        <button
          onClick={() => onNavigate('logistics')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'logistics' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <Truck className="w-5 h-5 mb-0.5" />
          <span>Logistics</span>
        </button>
      </nav>
    );
  }

  if (effectiveRole === 'admin') {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#002517] text-white border-t border-[#123B2A] px-2 py-1 shadow-lg flex items-center justify-around">
        <button
          onClick={() => onNavigate('admin-dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'admin-dashboard' ? 'text-[#9DF1C0]' : 'text-[#C1C8C2]'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => onNavigate('admin-products')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'admin-products' ? 'text-[#9DF1C0]' : 'text-[#C1C8C2]'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Moderation</span>
        </button>

        <button
          onClick={() => onNavigate('admin-users')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'admin-users' ? 'text-[#9DF1C0]' : 'text-[#C1C8C2]'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Users KYC</span>
        </button>

        <button
          onClick={() => onNavigate('admin-reports')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
            currentView === 'admin-reports' ? 'text-[#9DF1C0]' : 'text-[#C1C8C2]'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>Disputes</span>
        </button>
      </nav>
    );
  }

  // Public Navigation for mobile
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7DDC8] px-2 py-1 shadow-lg flex items-center justify-around">
      <button
        onClick={() => onNavigate('landing')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
          currentView === 'landing' ? 'text-[#002517]' : 'text-[#717973]'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => onNavigate('marketplace')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
          currentView === 'marketplace' ? 'text-[#002517]' : 'text-[#717973]'
        }`}
      >
        <Store className="w-5 h-5 mb-0.5" />
        <span>Marketplace</span>
      </button>

      <button
        onClick={() => onNavigate('market-prices')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
          currentView === 'market-prices' ? 'text-[#002517]' : 'text-[#717973]'
        }`}
      >
        <TrendingUp className="w-5 h-5 mb-0.5" />
        <span>Mandi Live</span>
      </button>

      <button
        onClick={() => onNavigate('logistics')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold ${
          currentView === 'logistics' ? 'text-[#002517]' : 'text-[#717973]'
        }`}
      >
        <Truck className="w-5 h-5 mb-0.5" />
        <span>Logistics</span>
      </button>

      <button
        onClick={onOpenAuthModal}
        className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold text-[#0D6C45]"
      >
        <User className="w-5 h-5 mb-0.5" />
        <span>Sign In</span>
      </button>
    </nav>
  );
};
