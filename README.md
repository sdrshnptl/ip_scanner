# Network IP Scanner Web App

A progressive web application (PWA) that scans network devices and ports, built with plain HTML, CSS, and JavaScript. This application can be hosted on GitHub Pages and works offline.

## Features

- **Network Device Scanning**: Identifies devices on your local network by IP address, MAC address, and hostname
- **Port Scanning**: Scans for open ports on selected devices
- **Service Identification**: Maps open ports to common services and applications
- **Offline Functionality**: Works without an internet connection after initial load
- **Installable**: Can be installed as a PWA on desktop and mobile devices
- **Persistent Data**: Scan results are saved for up to one week
- **New Device Detection**: Notifies when new devices are detected on the network
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Getting Started

### Local Development

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/ip-scanner.git
   cd ip-scanner
   ```

2. Serve the application using a local web server. For example, with Python:
   ```
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

3. Open your browser and navigate to `http://localhost:8000`

### Deploying to GitHub Pages

1. Create a repository on GitHub
2. Push this code to your repository
3. Enable GitHub Pages in your repository settings
4. Access your application at `https://yourusername.github.io/ip-scanner`

## Technical Details

### Architecture

The application is built with vanilla JavaScript using a modular approach:

- `app.js`: Main application initialization and global state
- `scanner.js`: Network and port scanning functionality
- `ui.js`: User interface rendering and interaction
- `storage.js`: Data persistence using localStorage
- `notifications.js`: In-app and browser notifications

### Offline Support

This application implements the following PWA features:

- **Service Worker**: Caches application assets for offline use
- **Web App Manifest**: Enables installation on compatible devices
- **LocalStorage**: Persists scan data when offline
- **Online/Offline Detection**: Adapts functionality based on connection status

### Security Considerations

This application runs entirely in the browser and has several security limitations:

1. **Browser Restrictions**: Modern browsers limit network scanning capabilities for security reasons
2. **Simulation Mode**: The current implementation simulates network scanning for demonstration purposes
3. **HTTPS Requirement**: Some features (notifications, PWA installation) require HTTPS deployment

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Android Chrome)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Network service mappings are based on IANA port assignments
- Icons created with SVG for optimal scaling and performance