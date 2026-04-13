
/**
 * Firebase configuration object.
 * এই তথ্যগুলো আপনার ফায়ারবেস কনসোল (Project Settings > General > Your Apps) থেকে পাওয়া যাবে।
 * এখানে আপনার প্রজেক্টের সঠিক তথ্যগুলো বসাতে হবে।
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSy...", // Replace with your actual API Key
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};
