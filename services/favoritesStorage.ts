import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'fairy_pages_favorites';

export const favoritesStorage = {
    async getFavorites(): Promise<number[]> {
        try {
            const data = await AsyncStorage.getItem(FAVORITES_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    async addFavorite(bookId: number): Promise<void> {
        const favorites = await this.getFavorites();
        if (!favorites.includes(bookId)) {
            favorites.unshift(bookId);
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    },

    async removeFavorite(bookId: number): Promise<void> {
        const favorites = await this.getFavorites();
        const updated = favorites.filter(id => id !== bookId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    },

    async isFavorite(bookId: number): Promise<boolean> {
        const favorites = await this.getFavorites();
        return favorites.includes(bookId);
    },

    async toggleFavorite(bookId: number): Promise<boolean> {
        const isFav = await this.isFavorite(bookId);
        if (isFav) {
            await this.removeFavorite(bookId);
            return false;
        } else {
            await this.addFavorite(bookId);
            return true;
        }
    },
};
