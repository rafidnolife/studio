
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

export type UserRole = 'admin' | 'user';
export interface ExtendedUser extends User {
  role: UserRole;
}

const ADMIN_PHONE = '+8801797958686';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const role: UserRole = firebaseUser.phoneNumber === ADMIN_PHONE ? 'admin' : 'user';
        setUser({ ...firebaseUser, role } as ExtendedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
