// Shared types — matches backend API models exactly

// ==================== AUTH ====================

export interface User {
    userId: number;
    name: string;
    email: string;
    isPremium: boolean;
    isAdmin: boolean;
    tier: string;
    premiumExpiresAt?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    token: string;
    email: string;
    name: string;
    userId: number;
    isAdmin: boolean;
    isPremium: boolean;
    tier: string;
    premiumExpiresAt?: string;
    message?: string;
}

// ==================== BOOK ====================

export interface Book {
    bookId: number;
    name: string;
    title: string | null;
    age: number;
    gender: string | null;
    language: string | null;
    theme: string;
    mainTopic: string | null;
    tone: string;
    giver: string;
    appearance: string | null;
    characters: CharacterInfo[] | null;
    content: string;
    pdfPath: string | null;
    coverImagePath: string | null;
    illustrations: string[] | null;
    pdfReady: boolean;
    isPublic: boolean;
    authorName: string;
    authorId: number;
    viewCount: number;
    downloadCount: number;
    createdAt: string;
}

export interface CharacterInfo {
    name: string;
    type: string;
    appearance?: string;
    description?: string;
}

export interface GenerateBookRequest {
    name: string;
    age: number;
    gender?: string;
    language?: string;
    theme: string;
    mainTopic?: string;
    tone: string;
    giver: string;
    appearance?: string;
    characters?: CharacterInfo[];
    coverStyle?: string;
    bookTitle?: string;
    length?: string;
    isPublic?: boolean;
}

export interface BookStatusResponse {
    coverReady: boolean;
    pdfReady: boolean;
    coverPath: string;
    pdfPath: string;
}

// ==================== USER ====================

export interface UserProfileResponse {
    userId: number;
    name: string;
    email: string;
    isPremium: boolean;
    bookCount: number;
    createdAt: string;
}

// ==================== API ====================

export interface ApiError {
    error: string;
    message?: string;
}
