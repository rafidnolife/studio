
'use client';

import { useEffect, useRef } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, limit, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  // Track when the hook was mounted to avoid showing old notifications
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (!user || !db) return;

    // Request notification permission as soon as user is logged in
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    // Query for unread notifications for the current user
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('read', '==', false),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
          
          // Only show if it's unread and was created after the app was loaded
          if (!data.read && createdAt > mountedAt.current - 10000) {
            
            // 1. Show In-App Toast
            toast({
              title: data.title,
              description: data.body,
            });

            // 2. Trigger Original Phone/System Notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                const n = new Notification(data.title, {
                  body: data.body,
                  icon: 'https://picsum.photos/seed/dokaan/192/192',
                  tag: change.doc.id, // Prevent duplicate notification grouping issues
                  requireInteraction: true,
                });
                
                // Play notification sound
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log('Audio playback blocked by browser', e));
                
                n.onclick = () => {
                  window.focus();
                  n.close();
                };
              } catch (e) {
                console.error('Failed to trigger system notification:', e);
              }
            }

            // Mark as read in Firestore so it doesn't trigger again
            const notificationRef = doc(db, 'notifications', change.doc.id);
            updateDoc(notificationRef, { read: true }).catch(err => console.error('Failed to update read status', err));
          }
        }
      });
    }, (error: any) => {
      console.error('Notification listener error:', error.message);
    });

    return () => unsubscribe();
  }, [user, db, toast]);
}
