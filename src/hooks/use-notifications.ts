
'use client';

import { useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !db) return;

    // Listen for new notifications for the current user
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Trigger browser notification if permission is granted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(data.title, {
              body: data.body,
              icon: 'https://picsum.photos/seed/dokaan/100/100',
              badge: 'https://picsum.photos/seed/dokaan/100/100',
              vibrate: [200, 100, 200],
            });

            // Play a notification sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));
          }

          // Show in-app toast
          toast({
            title: data.title,
            description: data.body,
          });

          // Mark as read after showing (optional, or wait for user click)
          const notificationRef = doc(db, 'notifications', change.doc.id);
          updateDoc(notificationRef, { read: true });
        }
      });
    }, (error) => {
      console.error('Notification listener error:', error);
    });

    // Request browser notification permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    return () => unsubscribe();
  }, [user, db, toast]);
}
