
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';

export type UserRole = 'admin' | 'user';
export interface ExtendedUser extends User {
  role: UserRole;
  displayName: string | null;
  phoneNumber: string | null;
}

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              ...firebaseUser,
              role: data.role || 'user',
              displayName: data.name || firebaseUser.displayName,
              phoneNumber: data.phoneNumber || firebaseUser.phoneNumber,
            } as ExtendedUser);
          } else {
            setUser({
              ...firebaseUser,
              role: 'user',
              displayName: firebaseUser.displayName,
              phoneNumber: firebaseUser.phoneNumber,
            } as ExtendedUser);
          }
          setLoading(false);
        }, (err) => {
          setLoading(false);
        });
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [auth, db]);

  return { user, loading };
}
