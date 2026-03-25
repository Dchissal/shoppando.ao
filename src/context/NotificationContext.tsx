import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Notification as AppNotification, NotificationType } from '../types';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  createNotification: (userId: string, type: NotificationType, title: string, message: string, data?: AppNotification['data']) => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  pushPermission: NotificationPermission | 'unsupported';
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Check push notification support
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(window.Notification.permission);
    } else {
      setPushPermission('unsupported');
    }
  }, []);

  // Listen to notifications from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const notification: AppNotification = {
            id: change.doc.id,
            ...data
          } as AppNotification;

          // Show browser push notification for new unread notifications
          if (!data.read && pushPermission === 'granted') {
            showPushNotification(notification);
          }
        }
      });

      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];

      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pushPermission]);

  // Show browser push notification
  const showPushNotification = (notification: AppNotification) => {
    if ('Notification' in window && window.Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: notification.message,
        icon: '/Assets/imagens/logo.png',
        badge: '/Assets/imagens/logo.png',
        tag: notification.id,
        data: notification.data,
        requireInteraction: false,
        silent: false
      };

      const pushNotif = new window.Notification(notification.title, options);

      pushNotif.onclick = () => {
        window.focus();
        if (notification.data?.link) {
          window.location.href = notification.data.link;
        }
        pushNotif.close();
      };
    }
  };

  // Request push notification permission
  const requestPushPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setPushPermission('unsupported');
      return false;
    }

    try {
      const permission = await window.Notification.requestPermission();
      setPushPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const batch = writeBatch(db);
      const unreadNotifs = notifications.filter(n => !n.read);

      unreadNotifs.forEach(notif => {
        batch.update(doc(db, 'notifications', notif.id), { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete single notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const batch = writeBatch(db);

      notifications.forEach(notif => {
        batch.delete(doc(db, 'notifications', notif.id));
      });

      await batch.commit();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Create a new notification
  const createNotification = useCallback(async (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: AppNotification['data']
  ) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        title,
        message,
        read: false,
        data: data || {},
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      createNotification,
      requestPushPermission,
      pushPermission
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
