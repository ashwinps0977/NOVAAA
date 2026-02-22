/**
 * config.ts
 * Centralized configuration for the application.
 * Change the API_BASE_URL here to point all systems to the same server.
 */

// If you are using a local server, replace 'localhost' with the server's IP address
// Example: export const API_BASE_URL = 'http://192.168.1.10:5000/api';
export const API_BASE_URL = 'http://192.168.1.7:5000/api';

export const getApiUrl = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};
