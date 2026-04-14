
'use client';

import { useEffect } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export function useNotifications() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const messaging = getMessaging();
          // Note: Replace with your actual VAPID key from Firebase Console
          const token = await getToken(messaging, { 
            vapidKey: 'BPI06-6pW-K0X1F5t_QZ5H-D1W9X0vQYy5H-D1W9X0vQYy5H-D1W9X0vQYy' 
          });

          if (token) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { fcmToken: token });
          }
        }
      } catch (error) {
        console.error('Failed to get FCM token:', error);
      }
    };

    requestPermission();

    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        new Notification(payload.notification?.title || 'New Notification', {
          body: payload.notification?.body,
          icon: '/favicon.ico',
        });
      }
    });

    return () => unsubscribe();
  }, [user, db]);
}
