/**
 * IP Scanner Web App
 * Data storage functionality using localStorage
 */

const STORAGE = {
    // Storage keys
    keys: {
        devices: 'ip-scanner-devices',
        ports: 'ip-scanner-ports',
        history: 'ip-scanner-history',
        lastScan: 'ip-scanner-last-scan'
    },
    
    init() {
        // Check for localStorage support
        if (!this.isStorageAvailable()) {
            console.error('localStorage is not available. Data persistence will not work.');
            NOTIFICATIONS.show('Warning: Storage is not available. Your scan results will not be saved.', 10000);
        }
    },
    
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // Device storage methods
    saveDevices(devices) {
        if (!this.isStorageAvailable()) return false;
        try {
            localStorage.setItem(this.keys.devices, JSON.stringify(devices));
            return true;
        } catch (error) {
            console.error('Error saving devices:', error);
            return false;
        }
    },
    
    getDevices() {
        if (!this.isStorageAvailable()) return null;
        try {
            const devices = localStorage.getItem(this.keys.devices);
            return devices ? JSON.parse(devices) : null;
        } catch (error) {
            console.error('Error retrieving devices:', error);
            return null;
        }
    },
    
    // Port storage methods
    savePorts(ports) {
        if (!this.isStorageAvailable()) return false;
        try {
            localStorage.setItem(this.keys.ports, JSON.stringify(ports));
            return true;
        } catch (error) {
            console.error('Error saving ports:', error);
            return false;
        }
    },
    
    getPorts() {
        if (!this.isStorageAvailable()) return null;
        try {
            const ports = localStorage.getItem(this.keys.ports);
            return ports ? JSON.parse(ports) : null;
        } catch (error) {
            console.error('Error retrieving ports:', error);
            return null;
        }
    },
    
    // History storage methods
    saveHistory(history) {
        if (!this.isStorageAvailable()) return false;
        try {
            localStorage.setItem(this.keys.history, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Error saving history:', error);
            return false;
        }
    },
    
    getHistory() {
        if (!this.isStorageAvailable()) return null;
        try {
            const history = localStorage.getItem(this.keys.history);
            return history ? JSON.parse(history) : null;
        } catch (error) {
            console.error('Error retrieving history:', error);
            return null;
        }
    },
    
    // Last scan time methods
    saveLastScan(timestamp) {
        if (!this.isStorageAvailable()) return false;
        try {
            localStorage.setItem(this.keys.lastScan, timestamp.toString());
            return true;
        } catch (error) {
            console.error('Error saving last scan time:', error);
            return false;
        }
    },
    
    getLastScan() {
        if (!this.isStorageAvailable()) return null;
        try {
            const lastScan = localStorage.getItem(this.keys.lastScan);
            return lastScan ? parseInt(lastScan, 10) : null;
        } catch (error) {
            console.error('Error retrieving last scan time:', error);
            return null;
        }
    },
    
    // Clear all stored data
    clearAll() {
        if (!this.isStorageAvailable()) return false;
        try {
            localStorage.removeItem(this.keys.devices);
            localStorage.removeItem(this.keys.ports);
            localStorage.removeItem(this.keys.history);
            localStorage.removeItem(this.keys.lastScan);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
};

// Export storage to global scope
window.STORAGE = STORAGE;