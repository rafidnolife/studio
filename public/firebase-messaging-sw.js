
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBuTSGIauHETcFsJuRdfrT9OmPb3JEAxxA",
  authDomain: "studio-2881360767-a8705.firebaseapp.com",
  projectId: "studio-2881360767-a8705",
  storageBucket: "studio-2881360767-a8705.firebasestorage.app",
  messagingSenderId: "664461256825",
  appId: "1:664461256825:web:58a4f5ab62af5a00688ca8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
