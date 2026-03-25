import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Package,
  ShoppingBag,
  Tag,
  Info,
  BellOff,
  BellRing,
  Loader
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Notification as AppNotification, NotificationType } from '../types';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    requestPushPermission,
    pushPermission
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order_status':
        return <Package className="w-5 h-5" />;
      case 'new_order':
        return <ShoppingBag className="w-5 h-5" />;
      case 'new_product':
        return <Tag className="w-5 h-5" />;
      case 'promo':
        return <Tag className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'order_status':
        return 'bg-blue-100 text-blue-600';
      case 'new_order':
        return 'bg-green-100 text-green-600';
      case 'new_product':
        return 'bg-purple-100 text-purple-600';
      case 'promo':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `Há ${minutes}min`;
    if (hours < 24) return `Há ${hours}h`;
    if (days < 7) return `Há ${days}d`;

    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.link) {
      navigate(notification.data.link);
    } else if (notification.type === 'order_status' && notification.data?.orderId) {
      navigate('/account');
    } else if (notification.type === 'new_product' && notification.data?.productId) {
      navigate(`/product/${notification.data.productId}`);
    }

    setIsOpen(false);
  };

  const handleEnablePush = async () => {
    await requestPushPermission();
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-neutral-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-900">Notificações</h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    {unreadCount > 0 ? `${unreadCount} não lidas` : 'Tudo em dia'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-2 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-400 hover:text-green-600"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="w-5 h-5" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="p-2 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-400 hover:text-red-600"
                    title="Limpar todas"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Push Notifications Banner */}
            {pushPermission === 'default' && (
              <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <BellRing className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-900 font-medium">Ativar notificações push?</span>
                </div>
                <button
                  onClick={handleEnablePush}
                  className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Ativar
                </button>
              </div>
            )}

            {pushPermission === 'denied' && (
              <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2 text-sm">
                <BellOff className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-500 font-medium">Notificações push bloqueadas</span>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-neutral-400">
                  <Loader className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm font-medium">A carregar...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-neutral-400">
                  <div className="bg-neutral-100 p-4 rounded-full mb-3">
                    <Bell className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-neutral-900">Sem notificações</p>
                  <p className="text-sm text-neutral-400 mt-1">Vamos notificá-lo sobre novidades</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-neutral-50 ${
                        !notification.read ? 'bg-orange-50/50' : ''
                      }`}
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-bold text-sm leading-tight ${!notification.read ? 'text-neutral-900' : 'text-neutral-600'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>

                      {!notification.read && (
                        <div className="shrink-0 w-2 h-2 bg-orange-600 rounded-full mt-2" />
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="shrink-0 p-1 hover:bg-neutral-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
                <button
                  onClick={() => {
                    navigate('/account');
                    setIsOpen(false);
                  }}
                  className="w-full py-2 text-center text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Ver todas as notificações
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
