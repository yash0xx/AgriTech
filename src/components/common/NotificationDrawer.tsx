import React, { useState } from 'react';
import { AppNotification, UserRole } from '../../types';
import { X, Bell, CheckCheck, Sparkles, ShoppingBag, Truck, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearAll?: () => void;
  onSelectNotification?: (notification: AppNotification) => void;
  onNavigate?: (view: string) => void;
  userRole?: UserRole;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onSelectNotification,
  onNavigate,
  userRole,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'AI Insights', 'Orders', 'Market', 'Logistics', 'System'];

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'All') return true;
    return notif.category === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI Insights':
        return <Sparkles className="w-4 h-4 text-[#0D6C45]" />;
      case 'Orders':
        return <ShoppingBag className="w-4 h-4 text-[#002517]" />;
      case 'Logistics':
        return <Truck className="w-4 h-4 text-[#C2962A]" />;
      case 'Market':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F7F5EF] border-l border-[#E7DDC8] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 bg-white border-b border-[#E7DDC8]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E6F0E8] flex items-center justify-center text-[#002517]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#002517] leading-tight">Notifications</h3>
                  <span className="text-xs text-[#717973]">
                    {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D6C45] hover:text-[#002517] px-2 py-1 rounded-md hover:bg-[#F2FCF3] transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#717973] hover:text-[#002517] hover:bg-[#E6F0E8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                    activeFilter === cat
                      ? 'bg-[#002517] text-white shadow-xs'
                      : 'bg-[#E6F0E8] text-[#525B54] hover:bg-[#D7E4DA]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Bell className="w-10 h-10 text-[#C1C8C2] mx-auto mb-3 opacity-60" />
                <h4 className="text-sm font-bold text-[#002517]">No notifications</h4>
                <p className="text-xs text-[#717973] mt-1 max-w-xs mx-auto">
                  You're all caught up with orders, mandi updates, and crop alerts.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (onSelectNotification) onSelectNotification(notif);
                    if (notif.linkAction && onNavigate) {
                      onNavigate(notif.linkAction);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                    notif.isRead
                      ? 'bg-white border-[#E7DDC8]'
                      : 'bg-[#F2FCF3] border-[#9DF1C0] ring-1 ring-[#9DF1C0]/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.isRead ? 'bg-[#F7F5EF]' : 'bg-[#E6F0E8]'
                    }`}>
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D6C45]">
                          {notif.category}
                        </span>
                        <span className="text-[10px] text-[#717973] shrink-0">{notif.timestamp}</span>
                      </div>

                      <h4 className="text-xs font-bold text-[#002517] leading-snug">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-[#525B54] mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.linkAction && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#0D6C45]">
                          <span>View details</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom helper */}
          <div className="p-3 bg-white border-t border-[#E7DDC8] text-center">
            <span className="text-[11px] text-[#717973]">
              Real-time updates synced with APMC Live & AgriTech network
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
