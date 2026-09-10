import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import {
  Store,
  TrendingUp,
  PlusCircle,
  ShoppingBag,
  Truck,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Users
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; // When logged out, users are directed to auth screens
  }

  if (role === 'FARMER') {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7DDC8] px-2 py-1 shadow-lg flex items-center justify-around">
        <button
          onClick={() => navigate('/farmer')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/farmer' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => navigate('/farmer/products')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/farmer/products' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>My Crops</span>
        </button>

        <button
          onClick={() => navigate('/farmer/products/new')}
          className="flex flex-col items-center justify-center -mt-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-[#002517] text-white flex items-center justify-center shadow-lg border-2 border-white active:scale-95">
            <PlusCircle className="w-6 h-6 text-[#9DF1C0]" />
          </div>
          <span className="text-[10px] font-bold text-[#002517] mt-0.5">Post Crop</span>
        </button>

        <button
          onClick={() => navigate('/farmer/requests')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/farmer/requests' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>Requests</span>
        </button>

        <button
          onClick={() => navigate('/market-prices')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/market-prices' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Mandi Live</span>
        </button>
      </nav>
    );
  }

  if (role === 'SELLER') {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7DDC8] px-2 py-1 shadow-lg flex items-center justify-around">
        <button
          onClick={() => navigate('/seller')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/seller' ? 'text-indigo-900' : 'text-[#717973]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => navigate('/seller/products')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/seller/products' ? 'text-indigo-900' : 'text-[#717973]'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Listings</span>
        </button>

        <button
          onClick={() => navigate('/seller/products/new')}
          className="flex flex-col items-center justify-center -mt-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-700 text-white flex items-center justify-center shadow-lg border-2 border-white active:scale-95">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-indigo-900 mt-0.5">Post Produce</span>
        </button>

        <button
          onClick={() => navigate('/seller/requests')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/seller/requests' ? 'text-indigo-900' : 'text-[#717973]'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>Requests</span>
        </button>

        <button
          onClick={() => navigate('/seller/orders')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/seller/orders' ? 'text-indigo-900' : 'text-[#717973]'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Orders</span>
        </button>
      </nav>
    );
  }

  if (role === 'BUYER') {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7DDC8] px-2 py-1 shadow-lg flex items-center justify-around">
        <button
          onClick={() => navigate('/buyer')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/buyer' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => navigate('/marketplace')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/marketplace' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Browse</span>
        </button>

        <button
          onClick={() => navigate('/buyer/orders')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/buyer/orders' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => navigate('/market-prices')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/market-prices' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Mandi Rates</span>
        </button>

        <button
          onClick={() => navigate('/logistics')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            location.pathname === '/logistics' ? 'text-[#002517]' : 'text-[#717973]'
          }`}
        >
          <Truck className="w-5 h-5 mb-0.5" />
          <span>Logistics</span>
        </button>
      </nav>
    );
  }

  // ADMIN Navigation for mobile
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#002517] text-white border-t border-[#123B2A] px-2 py-1 shadow-lg flex items-center justify-around">
      <button
        onClick={() => navigate('/admin')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
          location.pathname === '/admin' ? 'text-[#9DF1C0]' : 'text-[#C1C8C2]'
        }`}
      >
        <ShieldCheck className="w-5 h-5 mb-0.5" />
        <span>Command</span>
      </button>

      <button
        onClick={() => navigate('/admin/team')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
          location.pathname === '/admin/team' ? 'text-[#9DF1C0]' : 'text-[#C1C8C2]'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span>Team (6)</span>
      </button>

      <button
        onClick={() => navigate('/marketplace')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
          location.pathname === '/marketplace' ? 'text-[#9DF1C0]' : 'text-[#C1C8C2]'
        }`}
      >
        <Store className="w-5 h-5 mb-0.5" />
        <span>Market</span>
      </button>

      <button
        onClick={() => navigate('/market-prices')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer ${
          location.pathname === '/market-prices' ? 'text-[#9DF1C0]' : 'text-[#C1C8C2]'
        }`}
      >
        <TrendingUp className="w-5 h-5 mb-0.5" />
        <span>Mandi Live</span>
      </button>
    </nav>
  );
};
