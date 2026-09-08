import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Sprout } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isSuspended, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 animate-pulse flex items-center justify-center">
            <Sprout className="w-8 h-8 text-emerald-400 animate-bounce" />
          </div>
        </div>
        <div className="text-white font-medium text-lg tracking-wide">AgriTech</div>
        <p className="text-slate-400 text-sm mt-1">Verifying secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isSuspended && location.pathname !== '/suspended') {
    return <Navigate to="/suspended" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
