
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

    // Use a simplified query to avoid the need for a composite index
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
          
          if (!data.read && createdAt > mountedAt.current - 5000) {
            
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(data.title, {
                  body: data.body,
                  icon: 'https://picsum.photos/seed/dokaan/100/100',
                });
                
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));
              } catch (e) {
                console.error('Browser notification failed', e);
              }
            }

            toast({
              title: data.title,
              description: data.body,
            });

            const notificationRef = doc(db, 'notifications', change.doc.id);
            updateDoc(notificationRef, { read: true }).catch(err => console.error('Update failed', err));
          }
        }
      });
    }, (error: any) => {
      console.error('Notification listener error:', error.message);
    });

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    return () => unsubscribe();
  }, [user, db, toast]);
}
