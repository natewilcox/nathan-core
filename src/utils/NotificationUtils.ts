export async function requestPermissionForNotification() {

    if (Notification.permission !== 'denied') { 
        const permission = await Notification.requestPermission();
        console.info('Notification permission:', permission)
    }
}

export function sendNotification(message: string) {
    
    if (Notification.permission === "granted" && document.hidden) {

        var notification = new Notification(message);
        notification.onclick = function() {
            window.focus();
        };
    }
}