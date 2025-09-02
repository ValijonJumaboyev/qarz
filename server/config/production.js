// Production configuration
export const productionConfig = {
    // MongoDB connection
    MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/authDB',

    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRY: '7d',

    // Server configuration
    PORT: process.env.PORT || 3000,

    // CORS configuration
    CORS_ORIGINS: [
        'https://your-frontend-domain.vercel.app',
        'http://localhost:5173' // For local development
    ],

    // Environment
    NODE_ENV: 'production'
};
