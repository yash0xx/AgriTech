import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { MobileBottomNav } from '../components/common/MobileBottomNav';
import { NotificationDrawer } from '../components/common/NotificationDrawer';
import { Toast } from '../components/common/Toast';
import { useApp } from '../context/AppContext';

export const AppLayout: React.FC = () => {
  const {
    notifications,
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    handleMarkAllNotificationsRead,
    handleClearNotifications,
    toast,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col justify-between text-[#151E19]">
      <Header
        notifications={notifications}
        notificationsCount={notifications.filter((n) => !n.isRead).length}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearNotifications}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type || 'success'}
          onClose={() => {}}
        />
      )}
    </div>
  );
};
