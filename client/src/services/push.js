// Helper to register service worker and subscribe to push
import api from './api';

export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeForPush = async (vapidPublicKey) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const reg = await navigator.serviceWorker.register('/sw.js');

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  });

  // Send subscription to server
  try {
    await api.post('/users/push/subscribe', { subscription });
  } catch (err) {
    console.error('Failed to save subscription', err.response?.data || err.message || err);
  }

  return subscription;
};
