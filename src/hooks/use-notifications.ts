
'use client';

import { useEffect, useRef } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, limit, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (!user || !db) return;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

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
          
          if (!data.read && createdAt > mountedAt.current - 10000) {
            toast({
              title: data.title,
              description: data.body,
            });

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                const n = new Notification(data.title, {
                  body: data.body,
                  icon: 'https://picsum.photos/seed/dokaan/192/192',
                  tag: change.doc.id,
                  requireInteraction: true,
                });
                
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
