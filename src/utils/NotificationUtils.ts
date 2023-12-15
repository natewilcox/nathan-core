export async function requestPermissionForNotification() {

    if (Notification.permission !== 'denied') { 
        const permission = await Notification.requestPermission();
        console.info('Notification permission:', permission)
    }
}

export function sendNotification(title: string, body: string) {

    if (Notification.permission === "granted" && document.hidden) {

        var notification = new Notification(title, {
            body,
        });

        notification.onclick = function() {
            window.focus();
        };
    }
}