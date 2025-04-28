/**
 * IP Scanner Web App
 * UI handling functionality
 */

const UI = {
    init() {
        // Set up tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.target));
        });

        // Set up search functionality
        document.getElementById('device-search').addEventListener('input', this.filterDevices.bind(this));
        document.getElementById('port-search').addEventListener('input', this.filterPorts.bind(this));
        
        // Set up device selection for port scanning
        document.getElementById('device-list').addEventListener('click', this.handleDeviceSelection.bind(this));
        
        // Set up history date filter
        document.getElementById('history-date-filter').addEventListener('change', this.filterHistory.bind(this));
        
        // Set up clear history button
        document.getElementById('clear-history').addEventListener('click', this.clearHistory.bind(this));
        
        // Set up notification close button
        document.getElementById('notification-close').addEventListener('click', () => {
            document.getElementById('notification').classList.add('hidden');
        });
        
        // Initialize connection status
        this.updateConnectionStatus();
    },
    
    switchTab(tabId) {
        // Deactivate all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        
        // Activate selected tab
        document.querySelector(`.tab-btn[data-target="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    },
    
    filterDevices() {
        const searchTerm = document.getElementById('device-search').value.toLowerCase();
        const rows = document.querySelectorAll('#device-list tr');
        
        let visibleCount = 0;
        
        rows.forEach(row => {
            const deviceData = row.textContent.toLowerCase();
            if (deviceData.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        document.getElementById('device-count').textContent = `${visibleCount} devices found`;
        
        // Toggle empty state
        document.getElementById('no-devices').classList.toggle('hidden', visibleCount > 0);
    },
    
    filterPorts() {
        const searchTerm = document.getElementById('port-search').value.toLowerCase();
        const deviceFilter = document.getElementById('port-device-filter').value;
        const rows = document.querySelectorAll('#port-list tr');
        
        let visibleCount = 0;
        
        rows.forEach(row => {
            const portData = row.textContent.toLowerCase();
            const ipAddress = row.querySelector('td:first-child').textContent;
            
            const matchesSearch = portData.includes(searchTerm);
            const matchesDevice = deviceFilter === 'all' || ipAddress === deviceFilter;
            
            if (matchesSearch && matchesDevice) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Toggle empty state
        document.getElementById('no-ports').classList.toggle('hidden', visibleCount > 0);
    },
    
    filterHistory() {
        const dateFilter = document.getElementById('history-date-filter').value;
        const entries = document.querySelectorAll('.history-entry');
        
        if (!dateFilter) {
            entries.forEach(entry => entry.style.display = '');
            return;
        }
        
        const filterDate = new Date(dateFilter);
        filterDate.setHours(0, 0, 0, 0);
        
        let visibleCount = 0;
        
        entries.forEach(entry => {
            const timestamp = parseInt(entry.dataset.timestamp, 10);
            const entryDate = new Date(timestamp);
            entryDate.setHours(0, 0, 0, 0);
            
            if (entryDate.getTime() === filterDate.getTime()) {
                entry.style.display = '';
                visibleCount++;
            } else {
                entry.style.display = 'none';
            }
        });
        
        // Toggle empty state
        document.getElementById('no-history').classList.toggle('hidden', visibleCount > 0);
    },
    
    clearHistory() {
        if (confirm('Are you sure you want to clear all scan history?')) {
            APP.history = [];
            STORAGE.saveHistory([]);
            this.renderHistory();
        }
    },
    
    handleDeviceSelection(event) {
        const actionBtn = event.target.closest('.scan-ports-btn');
        if (!actionBtn) return;
        
        const row = actionBtn.closest('tr');
        const ipAddress = row.querySelector('td:first-child').textContent;
        const hostname = row.querySelector('td:nth-child(3)').textContent;
        
        // Find the device in APP.devices
        APP.selectedDevice = APP.devices.find(d => d.ip === ipAddress);
        
        // Enable port scan button
        document.getElementById('scan-ports').disabled = false;
        
        // Switch to ports tab
        this.switchTab('ports');
        
        // Update device filter in ports tab
        const deviceFilter = document.getElementById('port-device-filter');
        
        // Check if option already exists
        let optionExists = false;
        for (let i = 0; i < deviceFilter.options.length; i++) {
            if (deviceFilter.options[i].value === ipAddress) {
                optionExists = true;
                deviceFilter.selectedIndex = i;
                break;
            }
        }
        
        // Add option if it doesn't exist
        if (!optionExists) {
            const option = document.createElement('option');
            option.value = ipAddress;
            option.textContent = `${hostname} (${ipAddress})`;
            deviceFilter.appendChild(option);
            deviceFilter.value = ipAddress;
        }
        
        // Apply filter
        this.filterPorts();
    },
    
    renderDevices() {
        const deviceList = document.getElementById('device-list');
        deviceList.innerHTML = '';
        
        if (APP.devices && APP.devices.length > 0) {
            APP.devices.forEach(device => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${device.ip}</td>
                    <td>${device.mac}</td>
                    <td>${device.hostname}</td>
                    <td>
                        <span class="device-status status-${device.status}"></span>
                        ${device.status}
                        ${device.isNew ? '<span class="badge">New</span>' : ''}
                    </td>
                    <td>
                        <button class="btn small secondary scan-ports-btn">Scan Ports</button>
                    </td>
                `;
                deviceList.appendChild(row);
            });
            
            document.getElementById('device-count').textContent = `${APP.devices.length} devices found`;
            document.getElementById('no-devices').classList.add('hidden');
        } else {
            document.getElementById('device-count').textContent = '0 devices found';
            document.getElementById('no-devices').classList.remove('hidden');
        }
        
        // Update device filter in ports tab
        this.updateDeviceFilter();
    },
    
    renderPorts() {
        const portList = document.getElementById('port-list');
        portList.innerHTML = '';
        
        const selectedDevice = document.getElementById('port-device-filter').value;
        let filteredPorts = APP.ports;
        
        if (selectedDevice !== 'all') {
            filteredPorts = APP.ports.filter(port => port.ip === selectedDevice);
        }
        
        if (filteredPorts && filteredPorts.length > 0) {
            filteredPorts.forEach(port => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${port.ip}</td>
                    <td>${port.port}</td>
                    <td class="port-${port.status}">${port.status}</td>
                    <td>${port.service}</td>
                    <td>${port.application}</td>
                `;
                portList.appendChild(row);
            });
            
            document.getElementById('no-ports').classList.add('hidden');
        } else {
            document.getElementById('no-ports').classList.remove('hidden');
        }
    },
    
    renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        if (APP.history && APP.history.length > 0) {
            APP.history.forEach(entry => {
                const entryElement = document.createElement('div');
                entryElement.className = 'history-entry';
                entryElement.dataset.timestamp = entry.timestamp;
                
                const date = new Date(entry.timestamp);
                const formattedDate = date.toLocaleString();
                
                entryElement.innerHTML = `
                    <div class="history-date">${formattedDate}</div>
                    <div class="history-details">${entry.details}</div>
                `;
                
                historyList.appendChild(entryElement);
            });
            
            document.getElementById('no-history').classList.add('hidden');
        } else {
            document.getElementById('no-history').classList.remove('hidden');
        }
    },
    
    updateDeviceFilter() {
        const deviceFilter = document.getElementById('port-device-filter');
        
        // Save current selection
        const currentSelection = deviceFilter.value;
        
        // Clear existing options except 'All Devices'
        while (deviceFilter.options.length > 1) {
            deviceFilter.remove(1);
        }
        
        // Add options for each device
        if (APP.devices && APP.devices.length > 0) {
            APP.devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.ip;
                option.textContent = `${device.hostname} (${device.ip})`;
                deviceFilter.appendChild(option);
            });
        }
        
        // Restore selection if it exists, otherwise default to 'all'
        let selectionExists = false;
        for (let i = 0; i < deviceFilter.options.length; i++) {
            if (deviceFilter.options[i].value === currentSelection) {
                deviceFilter.selectedIndex = i;
                selectionExists = true;
                break;
            }
        }
        
        if (!selectionExists) {
            deviceFilter.selectedIndex = 0; // 'All Devices'
        }
    },
    
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        statusElement.textContent = navigator.onLine ? 'Online' : 'Offline';
        statusElement.className = navigator.onLine ? 'status-online' : 'status-offline';
    },
    
    updateLastScanTime() {
        const lastScanElement = document.getElementById('last-scan');
        
        if (APP.lastScan) {
            const date = new Date(APP.lastScan);
            lastScanElement.textContent = `Last scan: ${date.toLocaleString()}`;
        } else {
            lastScanElement.textContent = 'Last scan: Never';
        }
    },
    
    updateScanStatus(message, progress) {
        document.getElementById('scan-status').textContent = message;
        document.getElementById('scan-progress-bar').value = progress;
    },
    
    toggleScanProgress(show) {
        document.querySelector('.scan-progress').classList.toggle('hidden', !show);
        document.getElementById('scan-network').disabled = show;
        document.getElementById('scan-ports').disabled = show || !APP.selectedDevice;
    }
};

// Export UI to global scope
window.UI = UI;