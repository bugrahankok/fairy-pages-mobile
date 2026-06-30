import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
    language: string;
    setLanguage: (lang: string) => Promise<void>;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
    language: 'en',
    setLanguage: async () => {},
    notificationsEnabled: true,
    setNotificationsEnabled: async () => {},
});

const STORAGE_KEYS = {
    LANGUAGE: 'fairy_pages_setting_language',
    NOTIFICATIONS: 'fairy_pages_setting_notifications',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<string>('en');
    const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedLang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
            if (savedLang) {
                setLanguageState(savedLang);
            }

            const savedNotifs = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
            if (savedNotifs !== null) {
                setNotificationsEnabledState(savedNotifs === 'true');
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    };

    const setLanguage = async (lang: string) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
            setLanguageState(lang);
        } catch (error) {
            console.warn('Failed to save language setting:', error);
        }
    };

    const setNotificationsEnabled = async (enabled: boolean) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, enabled ? 'true' : 'false');
            setNotificationsEnabledState(enabled);
        } catch (error) {
            console.warn('Failed to save notifications setting:', error);
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                language,
                setLanguage,
                notificationsEnabled,
                setNotificationsEnabled,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => useContext(SettingsContext);
