import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
    DISCOVER_BOOKS: 'cache_discover_books',
    LIBRARY_BOOKS: 'cache_library_books',
    CACHE_TIMESTAMP: 'cache_timestamp',
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheData<T> {
    data: T;
    timestamp: number;
}

export const bookCache = {
    // Save books to cache
    async saveDiscoverBooks(books: any[]): Promise<void> {
        try {
            const cacheData: CacheData<any[]> = {
                data: books,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(CACHE_KEYS.DISCOVER_BOOKS, JSON.stringify(cacheData));
            console.log('💾 Discover books cached');
        } catch (error) {
            console.warn('Failed to cache discover books:', error);
        }
    },

    // Get cached discover books
    async getDiscoverBooks(): Promise<any[] | null> {
        try {
            const cached = await AsyncStorage.getItem(CACHE_KEYS.DISCOVER_BOOKS);
            if (!cached) return null;

            const cacheData: CacheData<any[]> = JSON.parse(cached);

            // Check if cache is still valid
            if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
                console.log('📦 Using cached discover books');
                return cacheData.data;
            }

            return null; // Cache expired
        } catch (error) {
            console.warn('Failed to read discover books cache:', error);
            return null;
        }
    },

    // Save library books to cache
    async saveLibraryBooks(books: any[]): Promise<void> {
        try {
            const cacheData: CacheData<any[]> = {
                data: books,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(CACHE_KEYS.LIBRARY_BOOKS, JSON.stringify(cacheData));
            console.log('💾 Library books cached');
        } catch (error) {
            console.warn('Failed to cache library books:', error);
        }
    },

    // Get cached library books
    async getLibraryBooks(): Promise<any[] | null> {
        try {
            const cached = await AsyncStorage.getItem(CACHE_KEYS.LIBRARY_BOOKS);
            if (!cached) return null;

            const cacheData: CacheData<any[]> = JSON.parse(cached);

            // Check if cache is still valid
            if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
                console.log('📦 Using cached library books');
                return cacheData.data;
            }

            return null; // Cache expired
        } catch (error) {
            console.warn('Failed to read library books cache:', error);
            return null;
        }
    },

    // Clear all book caches
    async clearCache(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                CACHE_KEYS.DISCOVER_BOOKS,
                CACHE_KEYS.LIBRARY_BOOKS,
            ]);
            console.log('🗑️ Book cache cleared');
        } catch (error) {
            console.warn('Failed to clear book cache:', error);
        }
    },

    // Force refresh - clear cache and return null
    async invalidateDiscoverBooks(): Promise<void> {
        try {
            await AsyncStorage.removeItem(CACHE_KEYS.DISCOVER_BOOKS);
        } catch (error) {
            console.warn('Failed to invalidate discover books cache:', error);
        }
    },

    async invalidateLibraryBooks(): Promise<void> {
        try {
            await AsyncStorage.removeItem(CACHE_KEYS.LIBRARY_BOOKS);
        } catch (error) {
            console.warn('Failed to invalidate library books cache:', error);
        }
    },
};
