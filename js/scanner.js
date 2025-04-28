/**
 * IP Scanner Web App
 * Network scanning functionality
 */

const SCANNER = {
    isScanning: false,
    scanProgress: 0,
    abortController: null,

    init() {
        // Set up event listeners for scan buttons
        document.getElementById('scan-network').addEventListener('click', this.startNetworkScan.bind(this));
        document.getElementById('scan-ports').addEventListener('click', this.startPortScan.bind(this));
    },

    async startNetworkScan() {
        if (this.isScanning) return;
        
        if (!navigator.onLine) {
            NOTIFICATIONS.show('Cannot scan network while offline.');
            return;
        }

        this.isScanning = true;
        this.scanProgress = 0;
        this.abortController = new AbortController();
        
        UI.updateScanStatus('Scanning network...', 0);
        UI.toggleScanProgress(true);
        
        try {
            const localIpInfo = await this.getLocalIpInfo();
            if (!localIpInfo) {
                throw new Error('Failed to retrieve local IP information');
            }
            
            const { localIp, subnet } = localIpInfo;
            const deviceInfo = await this.scanNetwork(localIp, subnet);
            
            // Save scan results
            const timestamp = Date.now();
            const newHistory = {
                type: 'network',
                timestamp,
                deviceCount: deviceInfo.length,
                details: `Scanned ${deviceInfo.length} devices on network`
            };
            
            APP.devices = deviceInfo;
            APP.lastScan = timestamp;
            APP.history = [newHistory, ...APP.history];
            
            // Save to storage
            STORAGE.saveDevices(APP.devices);
            STORAGE.saveLastScan(timestamp);
            STORAGE.saveHistory(APP.history);
            
            // Update UI
            UI.renderDevices();
            UI.updateLastScanTime();
            UI.renderHistory();
            
            // Check for new devices
            this.detectNewDevices(deviceInfo);
            
            NOTIFICATIONS.show(`Network scan complete. Found ${deviceInfo.length} devices.`);
        } catch (error) {
            console.error('Network scan failed:', error);
            NOTIFICATIONS.show(`Network scan failed: ${error.message}`);
        } finally {
            this.isScanning = false;
            UI.toggleScanProgress(false);
            this.abortController = null;
        }
    },
    
    async startPortScan() {
        if (this.isScanning) return;
        
        if (!navigator.onLine) {
            NOTIFICATIONS.show('Cannot scan ports while offline.');
            return;
        }
        
        if (!APP.selectedDevice) {
            NOTIFICATIONS.show('Please select a device to scan ports.');
            return;
        }
        
        this.isScanning = true;
        this.scanProgress = 0;
        this.abortController = new AbortController();
        
        const targetIp = APP.selectedDevice.ip;
        
        UI.updateScanStatus(`Scanning ports on ${targetIp}...`, 0);
        UI.toggleScanProgress(true);
        
        try {
            const portResults = await this.scanPorts(targetIp);
            
            // Save scan results
            const timestamp = Date.now();
            const openPorts = portResults.filter(p => p.status === 'open').length;
            
            const newHistory = {
                type: 'port',
                timestamp,
                targetIp,
                portCount: portResults.length,
                openCount: openPorts,
                details: `Scanned ${portResults.length} ports on ${targetIp}. Found ${openPorts} open ports.`
            };
            
            // Update existing ports or add new ones
            const existingPorts = APP.ports.filter(p => p.ip !== targetIp);
            APP.ports = [...existingPorts, ...portResults];
            APP.lastScan = timestamp;
            APP.history = [newHistory, ...APP.history];
            
            // Save to storage
            STORAGE.savePorts(APP.ports);
            STORAGE.saveLastScan(timestamp);
            STORAGE.saveHistory(APP.history);
            
            // Update UI
            UI.renderPorts();
            UI.updateLastScanTime();
            UI.renderHistory();
            
            NOTIFICATIONS.show(`Port scan complete. Found ${openPorts} open ports on ${targetIp}.`);
        } catch (error) {
            console.error('Port scan failed:', error);
            NOTIFICATIONS.show(`Port scan failed: ${error.message}`);
        } finally {
            this.isScanning = false;
            UI.toggleScanProgress(false);
            this.abortController = null;
        }
    },
    
    async getLocalIpInfo() {
        try {
            // Use WebRTC to get local IP address
            const pc = new RTCPeerConnection({
                iceServers: []
            });
            
            pc.createDataChannel('');
            await pc.createOffer().then(offer => pc.setLocalDescription(offer));
            
            return new Promise((resolve) => {
                let localIp = null;
                let subnet = '255.255.255.0'; // Default subnet mask
                
                pc.onicecandidate = (ice) => {
                    if (!ice || !ice.candidate || !ice.candidate.candidate) return;
                    
                    const candidateStr = ice.candidate.candidate;
                    const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(candidateStr);
                    
                    if (ipMatch && ipMatch[1] && !localIp) {
                        localIp = ipMatch[1];
                        
                        // Clean up
                        pc.onicecandidate = null;
                        pc.close();
                        
                        // Get subnet info
                        const ipParts = localIp.split('.');
                        if (ipParts[0] === '10' || 
                            (ipParts[0] === '172' && ipParts[1] >= 16 && ipParts[1] <= 31) || 
                            (ipParts[0] === '192' && ipParts[1] === '168')) {
                            // This is a private IP, extract subnet
                            subnet = '255.255.255.0'; // Most common for home networks
                        }
                        
                        resolve({ localIp, subnet });
                    }
                };
            });
        } catch (error) {
            console.error('Failed to get local IP:', error);
            return null;
        }
    },
    
    async scanNetwork(localIp, subnet) {
        const devices = [];
        const baseIp = localIp.split('.').slice(0, 3).join('.');
        const totalHosts = 254; // Standard class C network
        
        // For demo/simulation purposes, we'll generate some sample devices
        // In a real implementation, this would involve sending network requests to each IP
        const simulatedDevices = [
            {
                ip: localIp,
                mac: this.generateRandomMac(),
                hostname: 'This-Device',
                status: 'online',
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                isNew: false
            },
            {
                ip: `${baseIp}.1`,
                mac: this.generateRandomMac(),
                hostname: 'Router',
                status: 'online',
                firstSeen: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
                lastSeen: Date.now(),
                isNew: false
            }
        ];
        
        // Add some random devices
        for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
            const lastOctet = Math.floor(Math.random() * 253) + 2; // Between 2-254
            simulatedDevices.push({
                ip: `${baseIp}.${lastOctet}`,
                mac: this.generateRandomMac(),
                hostname: `Device-${lastOctet}`,
                status: Math.random() > 0.2 ? 'online' : 'offline',
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                isNew: true
            });
        }
        
        // Simulate scanning progress
        for (let i = 0; i < totalHosts; i++) {
            if (this.abortController && this.abortController.signal.aborted) {
                throw new Error('Scan aborted');
            }
            
            // Update progress
            this.scanProgress = Math.floor((i / totalHosts) * 100);
            UI.updateScanStatus(`Scanning network... ${i + 1}/${totalHosts}`, this.scanProgress);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        return simulatedDevices;
    },
    
    async scanPorts(targetIp) {
        const portResults = [];
        const commonPorts = [20, 21, 22, 23, 25, 53, 67, 68, 80, 110, 123, 137, 138, 139, 143, 161, 443, 445, 3389, 8080];
        const totalPorts = commonPorts.length;
        
        // For demo/simulation purposes, we'll generate some sample port results
        // In a real implementation, this would involve sending network requests to each port
        for (let i = 0; i < totalPorts; i++) {
            if (this.abortController && this.abortController.signal.aborted) {
                throw new Error('Scan aborted');
            }
            
            const port = commonPorts[i];
            
            // Update progress
            this.scanProgress = Math.floor((i / totalPorts) * 100);
            UI.updateScanStatus(`Scanning port ${port}... ${i + 1}/${totalPorts}`, this.scanProgress);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Simulate some ports being open (around 20% chance)
            const isOpen = Math.random() < 0.2;
            const serviceInfo = APP.serviceMap[port] || { service: 'Unknown', application: 'Unknown' };
            
            portResults.push({
                ip: targetIp,
                port,
                status: isOpen ? 'open' : 'closed',
                service: serviceInfo.service,
                application: serviceInfo.application,
                timestamp: Date.now()
            });
        }
        
        return portResults;
    },
    
    generateRandomMac() {
        const hexDigits = '0123456789ABCDEF';
        let mac = '';
        
        for (let i = 0; i < 6; i++) {
            const segment = hexDigits[Math.floor(Math.random() * 16)] + hexDigits[Math.floor(Math.random() * 16)];
            mac += segment + (i < 5 ? ':' : '');
        }
        
        return mac;
    },
    
    detectNewDevices(devices) {
        const previousScan = STORAGE.getDevices() || [];
        const previousIps = new Set(previousScan.map(device => device.ip));
        
        const newDevices = devices.filter(device => !previousIps.has(device.ip) && device.status === 'online');
        
        if (newDevices.length > 0) {
            newDevices.forEach(device => {
                NOTIFICATIONS.show(`New device detected: ${device.hostname || device.ip} (${device.ip})`, 10000);
            });
        }
    },
    
    abortScan() {
        if (this.abortController) {
            this.abortController.abort();
            this.isScanning = false;
            UI.toggleScanProgress(false);
            NOTIFICATIONS.show('Scan aborted');
        }
    }
};

// Export scanner to global scope
window.SCANNER = SCANNER;