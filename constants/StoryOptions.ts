export const USER_TIERS = {
    FREE: 'free',
    PREMIUM: 'premium',
} as const;

export const TIER_LEVELS: Record<string, number> = {
    [USER_TIERS.FREE]: 0,
    [USER_TIERS.PREMIUM]: 1,
};

export const STORY_THEMES = [
    { value: 'Space Explorer', label: 'Space Explorer', icon: 'rocket', description: 'Blast off to planets unknown', minTier: USER_TIERS.FREE },
    { value: 'Enchanted Forest', label: 'Enchanted Forest', icon: 'tree', description: 'Discover fairies and talking animals', minTier: USER_TIERS.FREE },
    { value: 'Ocean Mysteries', label: 'Ocean Mysteries', icon: 'water', description: 'Dive deep to find sunken treasure', minTier: USER_TIERS.PREMIUM },
    { value: 'Dinosaur Land', label: 'Dinosaur Land', icon: 'paw', description: 'Meet friendly prehistoric giants', minTier: USER_TIERS.PREMIUM },
    { value: 'Magical Kingdom', label: 'Magical Kingdom', icon: 'castle', description: 'Rule a kingdom with magic', minTier: USER_TIERS.PREMIUM },
    { value: 'Superhero City', label: 'Superhero City', icon: 'shield', description: 'Save the city with superpowers', minTier: USER_TIERS.PREMIUM },
];

export const STORY_AGES = [
    { value: '3', label: '0-3 years', icon: 'baby' },
    { value: '5', label: '3-5 years', icon: 'child' },
    { value: '8', label: '6-8 years', icon: 'person' },
    { value: '12', label: '9-12 years', icon: 'person-outline' },
];

export const STORY_LENGTHS = [
    { value: 'Short', label: 'Short Story', description: 'Perfect for bedtime (500-800 words)', minTier: USER_TIERS.FREE },
    { value: 'Medium', label: 'Standard Story', description: 'A full adventure (1500-2000 words)', minTier: USER_TIERS.PREMIUM },
    { value: 'Long', label: 'Epic Tale', description: 'An in-depth journey (3000+ words)', minTier: USER_TIERS.PREMIUM },
];

export const STORY_TONES = [
    { value: 'Warm', label: 'Warm & Cozy', icon: 'heart', minTier: USER_TIERS.FREE },
    { value: 'Playful', label: 'Playful', icon: 'happy', minTier: USER_TIERS.FREE },
    { value: 'Exciting', label: 'Exciting', icon: 'flash', minTier: USER_TIERS.PREMIUM },
    { value: 'Magical', label: 'Magical', icon: 'sparkles', minTier: USER_TIERS.PREMIUM },
    { value: 'Epic', label: 'Epic Adventure', icon: 'star', minTier: USER_TIERS.PREMIUM },
];

export const COVER_STYLES = [
    { value: 'storybook', label: 'Classic Storybook', description: 'Timeless illustration style', minTier: USER_TIERS.FREE },
    { value: 'cartoon', label: 'Fun Cartoon', description: 'Colorful cartoon art', minTier: USER_TIERS.PREMIUM },
    { value: 'watercolor', label: 'Watercolor', description: 'Soft watercolor painting', minTier: USER_TIERS.PREMIUM },
    { value: 'anime', label: 'Anime', description: 'Japanese anime style', minTier: USER_TIERS.PREMIUM },
    { value: '3d', label: '3D Cartoon', description: '3D rendered style', minTier: USER_TIERS.PREMIUM },
    { value: 'realistic', label: 'Realistic', description: 'Realistic digital art', minTier: USER_TIERS.PREMIUM },
];

export const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'es', label: 'Español' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
];

export const GENDERS = [
    { value: 'boy', label: 'Boy' },
    { value: 'girl', label: 'Girl' },
    { value: 'neutral', label: 'Neutral' },
];
