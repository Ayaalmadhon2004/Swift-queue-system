export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.warn("هذا المتصفح لا يدعم الإشعارات.");
        return;
    }

    if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
            console.log("تم تفعيل الإشعارات بنجاح! 🎉");
            new Notification("SwiftQueue", { body: "شكراً لتفعيل التنبيهات!" });
        }
    }
};