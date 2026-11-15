"use client";

import { useEffect } from "react";

export function SWRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const onLoad = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration.scope);

            const intervalId = setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Every hour

            const onUpdateFound = () => {
              const newWorker = registration.installing;
              if (newWorker) {
                const onStateChange = () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    showUpdatePrompt();
                  }
                };
                newWorker.addEventListener('statechange', onStateChange);
              }
            };
            registration.addEventListener('updatefound', onUpdateFound);

            return () => {
              clearInterval(intervalId);
              registration.removeEventListener('updatefound', onUpdateFound);
            };
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      };

      window.addEventListener('load', onLoad);

      return () => {
        window.removeEventListener('load', onLoad);
      };
    }
    return undefined;
  }, []);

  const showUpdatePrompt = () => {
    if (confirm('A new version of Tuiton is available. Refresh to update?')) {
      window.location.reload();
    }
  };

  return null;
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    return Notification.requestPermission();
  }
  return Promise.resolve(Notification.permission);
}