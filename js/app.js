/**
 * IP Scanner Web App
 * Main application file that initializes the application
 */

// Global app state
const APP = {
    isOnline: navigator.onLine,
    devices: [],
    ports: [],
    history: [],
    lastScan: null,
    selectedDevice: null,
    serviceMap: {
        // Common ports and their associated services
        20: { service: 'FTP Data', application: 'File Transfer Protocol' },
        21: { service: 'FTP Control', application: 'File Transfer Protocol' },
        22: { service: 'SSH', application: 'Secure Shell' },
        23: { service: 'Telnet', application: 'Terminal Emulation' },
        25: { service: 'SMTP', application: 'Simple Mail Transfer Protocol' },
        53: { service: 'DNS', application: 'Domain Name System' },
        67: { service: 'DHCP Server', application: 'Dynamic Host Configuration Protocol' },
        68: { service: 'DHCP Client', application: 'Dynamic Host Configuration Protocol' },
        80: { service: 'HTTP', application: 'Web Server' },
        110: { service: 'POP3', application: 'Post Office Protocol' },
        123: { service: 'NTP', application: 'Network Time Protocol' },
        137: { service: 'NetBIOS Name', application: 'Windows Networking' },
        138: { service: 'NetBIOS Datagram', application: 'Windows Networking' },
        139: { service: 'NetBIOS Session', application: 'Windows File Sharing' },
        143: { service: 'IMAP', application: 'Internet Message Access Protocol' },
        161: { service: 'SNMP', application: 'Simple Network Management Protocol' },
        443: { service: 'HTTPS', application: 'Secure Web Server' },
        445: { service: 'SMB', application: 'Windows File Sharing' },
        3389: { service: 'RDP', application: 'Remote Desktop Protocol' },
        8080: { service: 'HTTP Alt', application: 'Web Server (Alternative)' }
    }
};

// Initialize the app when the document is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    console.log('IP Scanner Web App initializing...');
    
    // Initialize UI components
    UI.init();
    
    // Initialize storage
    STORAGE.init();
    
    // Load saved data
    loadSavedData();
    
    // Initialize network scanner
    SCANNER.init();
    
    // Set up notifications
    NOTIFICATIONS.init();
    
    // Set up online/offline event listeners
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    
    console.log('IP Scanner Web App initialized');
}

function handleConnectionChange() {
    APP.isOnline = navigator.onLine;
    UI.updateConnectionStatus();
    
    if (APP.isOnline) {
        NOTIFICATIONS.show('Connection restored. You are now online.');
    } else {
        NOTIFICATIONS.show('You are offline. Some features may be limited.');
    }
}

function loadSavedData() {
    // Load devices, ports and scan history from storage
    APP.devices = STORAGE.getDevices() || [];
    APP.ports = STORAGE.getPorts() || [];
    APP.history = STORAGE.getHistory() || [];
    APP.lastScan = STORAGE.getLastScan() || null;
    
    // Update UI with loaded data
    UI.renderDevices();
    UI.renderPorts();
    UI.renderHistory();
    UI.updateLastScanTime();
    
    // Clean up old history entries (older than 1 week)
    cleanupOldHistory();
}

function cleanupOldHistory() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
    
    APP.history = APP.history.filter(entry => entry.timestamp > oneWeekAgo);
    
    // Save updated history
    STORAGE.saveHistory(APP.history);
}

// Export app methods
window.APP = {
    ...APP,
    init: initApp,
    handleConnectionChange
};