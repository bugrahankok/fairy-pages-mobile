import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Use your machine's IP address for iOS Simulator (localhost doesn't work)
const API_BASE_URL = 'http://192.168.0.54:8080';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper to wait for a specified time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to check network connectivity
const checkNetworkConnection = async (): Promise<boolean> => {
    try {
        const state = await NetInfo.fetch();
        return state.isConnected ?? false;
    } catch {
        return true; // Assume connected if check fails
    }
};

// Helper to determine if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
    // Retry on network errors
    if (!error.response) return true;

    // Retry on specific status codes (server errors and timeout)
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.response.status);
};

// Create axios instance with enhanced configuration
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor with logging
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Check network connectivity
        const isConnected = await checkNetworkConnection();
        if (!isConnected) {
            console.warn('📡 No network connection detected');
            throw new axios.Cancel('No network connection');
        }

        // Add auth token if available
        const token = await AsyncStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        config.headers['X-Request-ID'] = requestId;

        // Log request (debug mode)
        if (__DEV__) {
            console.log(`🚀 [${requestId}] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error.message);
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log successful response
        if (__DEV__) {
            const requestId = response.config.headers?.['X-Request-ID'] || 'unknown';
            console.log(`✅ [${requestId}] ${response.status} ${response.config.url}`);
        }
        return response;
    },
    async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

        // Handle missing config (shouldn't happen but be safe)
        if (!config) {
            return Promise.reject(error);
        }

        // Initialize retry count
        config._retryCount = config._retryCount || 0;

        const requestId = config.headers?.['X-Request-ID'] || 'unknown';
        const status = error.response?.status || 'NETWORK_ERROR';
        const url = config.url || 'unknown';

        // Log error details
        console.error(`❌ [${requestId}] ${status} ${url} (attempt ${config._retryCount + 1}/${MAX_RETRIES + 1})`);

        // For 401 errors - DON'T clear token here, let AuthContext handle it
        // This prevents race conditions where multiple requests clear the token
        if (error.response?.status === 401) {
            console.warn('🔐 Received 401 - token may be expired or invalid');
            // Don't retry 401 errors
            return Promise.reject(error);
        }

        // For 403 errors on authenticated endpoints, don't retry
        // 403 typically means token is missing/invalid, not a temporary issue
        if (error.response?.status === 403) {
            const isPublicEndpoint = url.includes('/api/book/discover') ||
                url.includes('/cover') ||
                url.includes('/api/auth/');
            if (!isPublicEndpoint) {
                console.warn('🚫 403 on authenticated endpoint - not retrying');
                return Promise.reject(error);
            }
        }

        // Retry logic for retryable errors
        if (isRetryableError(error) && config._retryCount < MAX_RETRIES) {
            config._retryCount++;

            // Calculate delay with exponential backoff
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, config._retryCount - 1);

            console.log(`🔄 Retrying request in ${delay}ms (attempt ${config._retryCount}/${MAX_RETRIES})`);

            await sleep(delay);

            // Re-check network before retry
            const isConnected = await checkNetworkConnection();
            if (!isConnected) {
                console.error('📡 Still no network connection, aborting retry');
                return Promise.reject(new Error('No network connection'));
            }

            return api.request(config);
        }

        // Enhanced error message
        const enhancedError = {
            ...error,
            message: getErrorMessage(error),
        };

        return Promise.reject(enhancedError);
    }
);

// Helper to get user-friendly error message
const getErrorMessage = (error: AxiosError): string => {
    if (!error.response) {
        return 'Unable to connect to server. Please check your internet connection.';
    }

    switch (error.response.status) {
        case 400:
            return 'Invalid request. Please check your input.';
        case 401:
            return 'Session expired. Please log in again.';
        case 403:
            return 'Access denied. You don\'t have permission to access this resource.';
        case 404:
            return 'Resource not found.';
        case 429:
            return 'Too many requests. Please wait a moment and try again.';
        case 500:
        case 502:
        case 503:
        case 504:
            return 'Server error. Please try again later.';
        default:
            return error.message || 'An unexpected error occurred.';
    }
};

export const authApi = {
    login: (email: string, password: string) =>
        api.post('/api/auth/login', { email, password }),
    register: (name: string, email: string, password: string) =>
        api.post('/api/auth/register', { name, email, password }),
    getMe: () => api.get('/api/auth/me'),
    updateProfile: (name: string) => api.put('/api/auth/profile', { name }),
};

export const bookApi = {
    discover: () => api.get('/api/book/discover'),
    history: () => api.get('/api/book/history'),
    getById: (id: number) => api.get(`/api/book/${id}`),
    generate: (data: any) => api.post('/api/book/generate', data),
    downloadPdf: (id: number) => api.get(`/api/book/${id}/pdf`, { responseType: 'blob' }),
    getCover: (id: number) => `${API_BASE_URL}/api/book/${id}/cover`,
    checkStatus: (id: number) => api.get(`/api/book/${id}/status`),
    updateVisibility: (id: number, isPublic: boolean) =>
        api.patch(`/api/book/${id}/visibility`, { isPublic }),
    delete: (id: number) => api.delete(`/api/book/${id}`),
};

export const userApi = {
    getProfile: () => api.get('/api/user/profile'),
};

export const subscriptionApi = {
    sync: (isPro: boolean) => api.post('/api/subscription/sync', { isPro }),
};

export { API_BASE_URL };
export default api;
