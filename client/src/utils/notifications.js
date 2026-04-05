// src/utils/notifications.js

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.warn("هذا المتصفح لا يدعم الإشعارات.");
        return;
    }
    if (Notification.permission === "default") {
        await Notification.requestPermission();
    }
};

export const sendNotification = (title, options) => {
    if (Notification.permission === "granted") {
        new Notification(title, options);
    }
};