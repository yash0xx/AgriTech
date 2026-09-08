import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { PlatformRole } from '../types';

interface RoleRouteProps {
  allowedRoles: PlatformRole[];
  requireTeam?: boolean;
  children?: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRoles,
  requireTeam = false,
  children,
}) => {
  const { role, teamMember } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    // Redirect user to their own role's dashboard
    if (role === 'FARMER') return <Navigate to="/farmer" replace />;
    if (role === 'SELLER') return <Navigate to="/seller" replace />;
    if (role === 'BUYER') return <Navigate to="/buyer" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  // If specific internal team membership is required (e.g. /admin/team)
  if (requireTeam && !teamMember) {
    return <Navigate to="/admin" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
