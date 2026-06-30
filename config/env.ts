import Constants from 'expo-constants';

interface EnvConfig {
    API_URL: string;
}

const ENV: Record<string, EnvConfig> = {
    dev: {
        API_URL: 'http://192.168.0.9:8080',
    },
    prod: {
        API_URL: 'https://api.fairypages.com', // TODO: Update with production URL
    },
};

function getEnvVars(): EnvConfig {
    // Check Expo Constants for release channel
    const extra = Constants.expoConfig?.extra;
    if (extra?.apiUrl) {
        return { API_URL: extra.apiUrl };
    }
    return __DEV__ ? ENV.dev : ENV.prod;
}

const Config = getEnvVars();
export default Config;
