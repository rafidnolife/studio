
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

    // Simplified query to avoid the need for a composite index
    // We filter by recipientId only and handle 'read' status and 'sorting' client-side
    // to ensure immediate functionality without manual index creation.
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
          
          // Only show toast if:
          // 1. Notification is unread
          // 2. Notification was created AFTER this component was loaded (to avoid spamming on refresh)
          if (!data.read && createdAt > mountedAt.current - 5000) {
            
            // Trigger browser notification if permission is granted
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(data.title, {
                  body: data.body,
                  icon: 'https://picsum.photos/seed/dokaan/100/100',
                });
                
                // Play a notification sound
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));
              } catch (e) {
                console.error('Browser notification failed', e);
              }
            }

            // Show in-app toast
            toast({
              title: data.title,
              description: data.body,
            });

            // Mark as read automatically or keep it for the notification center
            // For now, let's mark as read to prevent repeat toasts
            const notificationRef = doc(db, 'notifications', change.doc.id);
            updateDoc(notificationRef, { read: true }).catch(err => console.error('Update failed', err));
          }
        }
      });
    }, (error: any) => {
      // If it's still an index error (rare with simplified query), we catch it here
      console.error('Notification listener error:', error.message);
    });

    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    return () => unsubscribe();
  }, [user, db, toast]);
}
