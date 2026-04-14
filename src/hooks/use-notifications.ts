
'use client';

import { useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    // Register Service Worker for background notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    }

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const messaging = getMessaging();
          // Note: In a real app, use your project's VAPID key from Firebase Console -> Project Settings -> Cloud Messaging
          const token = await getToken(messaging, { 
            vapidKey: 'BPI06-6pW-K0X1F5t_QZ5H-D1W9X0vQYy5H-D1W9X0vQYy5H-D1W9X0vQYy' 
          });

          if (token) {
            const userRef = doc(db, 'users', user.uid);
            updateDoc(userRef, { fcmToken: token });
          }
        }
      } catch (error) {
        console.error('Failed to get FCM token:', error);
      }
    };

    requestPermission();

    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground Message received: ', payload);
      
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const notificationTitle = payload.notification?.title || 'দোকান এক্সপ্রেস';
        const notificationOptions = {
          body: payload.notification?.body,
          icon: 'https://picsum.photos/seed/dokaan/100/100',
          badge: 'https://picsum.photos/seed/dokaan/100/100',
          vibrate: [200, 100, 200], // Vibration pattern
          tag: 'order-update',
          renotify: true
        };

        // Trigger system notification
        new Notification(notificationTitle, notificationOptions);

        // Also show a toast in-app for visual feedback
        toast({
          title: notificationTitle,
          description: payload.notification?.body,
        });
      }
    });

    return () => unsubscribe();
  }, [user, db, toast]);
}
