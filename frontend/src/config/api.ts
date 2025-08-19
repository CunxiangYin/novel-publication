/**
 * API Configuration
 * Automatically detects and uses the appropriate API URL based on the environment
 */

// Get the current hostname
const hostname = window.location.hostname;
const protocol = window.location.protocol;

// Determine the API URL based on the environment
let API_BASE_URL: string;

if (import.meta.env.MODE === 'development') {
  // In development, use the Vite proxy
  API_BASE_URL = '';
} else if (hostname === 'localhost' || hostname === '127.0.0.1') {
  // Local production build
  API_BASE_URL = 'http://localhost:8038';
} else {
  // LAN or production environment - use the same host but different port
  API_BASE_URL = `${protocol}//${hostname}:8038`;
}

// Export configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  ENDPOINTS: {
    NOVEL: {
      PARSE: '/api/novel/parse',
      UPDATE: '/api/novel/update',
      PUBLISH: '/api/novel/publish',
      UPLOAD: '/api/novel/upload',
      LIST: '/api/novel/list',
      GENERATE: '/api/novel/generate',
      HEALTH: '/api/novel/health',
    },
    TEXT: {
      STRIP: '/api/text-strip/strip',
    },
    WS: {
      CONNECT: (clientId: string) => {
        const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = API_BASE_URL ? new URL(API_BASE_URL).host : `${hostname}:8038`;
        return `${wsProtocol}//${wsHost}/ws/${clientId}`;
      },
    },
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to check if API is reachable
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(getApiUrl('/api/novel/health'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Log configuration for debugging
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    mode: import.meta.env.MODE,
    hostname,
    protocol,
    apiBaseUrl: API_BASE_URL,
  });
}

export default API_CONFIG;