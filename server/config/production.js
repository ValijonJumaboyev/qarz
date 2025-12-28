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
        'http://localhost:5173', // For local development
        // Allow local network IPs in development (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+):5173$/
    ],

    // Environment
    NODE_ENV: 'production'
};
