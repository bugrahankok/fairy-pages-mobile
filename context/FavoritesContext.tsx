import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { favoritesStorage } from '../services/favoritesStorage';

interface FavoritesContextType {
    favorites: number[];
    isFavorite: (bookId: number) => boolean;
    toggleFavorite: (bookId: number) => Promise<void>;
    loadFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    isFavorite: () => false,
    toggleFavorite: async () => {},
    loadFavorites: async () => {},
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<number[]>([]);

    const loadFavorites = useCallback(async () => {
        const favs = await favoritesStorage.getFavorites();
        setFavorites(favs);
    }, []);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const isFavorite = useCallback((bookId: number) => {
        return favorites.includes(bookId);
    }, [favorites]);

    const toggleFavorite = useCallback(async (bookId: number) => {
        const nowFavorite = await favoritesStorage.toggleFavorite(bookId);
        if (nowFavorite) {
            setFavorites(prev => [bookId, ...prev]);
        } else {
            setFavorites(prev => prev.filter(id => id !== bookId));
        }
    }, []);

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loadFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export const useFavorites = () => useContext(FavoritesContext);
