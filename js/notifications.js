/**
 * IP Scanner Web App
 * Notification functionality with browser notification support
 */

const NOTIFICATIONS = {
    hasPermission: false,
    notificationQueue: [],
    notificationElement: null,
    notificationTimeout: null,
    
    init() {
        this.notificationElement = document.getElementById('notification');
        
        // Check if browser notifications are supported and request permission
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.hasPermission = true;
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.hasPermission = true;
                    }
                });
            }
        }
    },
    
    /**
     * Show a notification to the user
     * @param {string} message - The message to display
     * @param {number} duration - Time in ms to show the notification (default: 5000)
     * @param {boolean} useBrowserNotification - Whether to use browser notifications (default: false)
     */
    show(message, duration = 5000, useBrowserNotification = false) {
        // Add to queue to prevent overlapping notifications
        this.notificationQueue.push({
            message,
            duration,
            useBrowserNotification
        });
        
        // If no notification is currently shown, process the queue
        if (!this.notificationElement.classList.contains('active')) {
            this.processNotificationQueue();
        }
    },
    
    processNotificationQueue() {
        // If queue is empty, stop processing
        if (this.notificationQueue.length === 0) return;
        
        // Get the next notification from the queue
        const notification = this.notificationQueue.shift();
        
        // Show browser notification if requested and available
        if (notification.useBrowserNotification && this.hasPermission) {
            this.showBrowserNotification('Network IP Scanner', notification.message);
        }
        
        // Show in-app notification
        this.showInAppNotification(notification.message, notification.duration);
    },
    
    showInAppNotification(message, duration) {
        // Clear any existing timeout
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
        
        // Update notification message
        document.getElementById('notification-message').textContent = message;
        
        // Show notification
        this.notificationElement.classList.remove('hidden');
        this.notificationElement.classList.add('active');
        
        // Set timeout to hide notification
        this.notificationTimeout = setTimeout(() => {
            this.notificationElement.classList.remove('active');
            this.notificationElement.classList.add('hidden');
            
            // Process next notification in queue after a short delay
            setTimeout(() => this.processNotificationQueue(), 300);
        }, duration);
    },
    
    showBrowserNotification(title, message) {
        if (!this.hasPermission) return;
        
        // Create and show browser notification
        const notification = new Notification(title, {
            body: message,
            icon: 'images/notification-icon.png' // Updated to relative path
        });
        
        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
        
        // Handle notification click
        notification.onclick = () => {
            // Bring app to focus when notification is clicked
            window.focus();
            notification.close();
        };
    },
    
    /**
     * Request permission for browser notifications
     */
    requestPermission() {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notifications');
            return;
        }
        
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                this.hasPermission = true;
                this.show('Notifications enabled!');
            }
        });
    }
};

// Export notifications to global scope
window.NOTIFICATIONS = NOTIFICATIONS;