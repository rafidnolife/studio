
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
          
          // Using a placeholder that follows base64url format to avoid "Invalid Server Key" error
          // Note: User must replace this with their actual VAPID key from Firebase Console
          const VAPID_KEY = 'BF3W9Q_G9Z_R9Z_G9Z_R9Z_G9Z_R9Z_G9Z_R9Z_G9Z_R9Z_G9Z_R9Z_G9Z_R9Z_G9Z_R9Z_G9Z_R9Z_G9Z_R9Z_I';
          
          const token = await getToken(messaging, { 
            vapidKey: VAPID_KEY 
          }).catch(err => {
            console.warn('Could not get FCM token. Make sure VAPID key is correct in Firebase Console.', err);
            return null;
          });

          if (token) {
            const userRef = doc(db, 'users', user.uid);
            updateDoc(userRef, { fcmToken: token });
          }
        }
      } catch (error) {
        console.error('Failed to handle notification permission:', error);
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
          vibrate: [200, 100, 200], // Vibration pattern for phones
          tag: 'order-update',
          renotify: true
        };

        // Trigger system notification
        new Notification(notificationTitle, notificationOptions);

        // Also show a toast in-app
        toast({
          title: notificationTitle,
          description: payload.notification?.body,
        });
      }
    });

    return () => unsubscribe();
  }, [user, db, toast]);
}
