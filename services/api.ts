import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your machine's IP address for iOS Simulator (localhost doesn't work)
const API_BASE_URL = 'http://192.168.0.54:8080';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email: string, password: string) =>
        api.post('/api/auth/login', { email, password }),
    register: (name: string, email: string, password: string) =>
        api.post('/api/auth/register', { name, email, password }),
    getMe: () => api.get('/api/auth/me'),
};

export const bookApi = {
    discover: () => api.get('/api/book/discover'),
    history: () => api.get('/api/book/history'),
    getById: (id: number) => api.get(`/api/book/${id}`),
    generate: (data: any) => api.post('/api/book/generate', data),
    downloadPdf: (id: number) => api.get(`/api/book/${id}/pdf`, { responseType: 'blob' }),
    getCover: (id: number) => `${API_BASE_URL}/api/book/${id}/cover`,
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
