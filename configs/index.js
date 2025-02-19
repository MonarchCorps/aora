const NODE_ENV = process.env.EXPO_PUBLIC_MODE_ENV || "development";

const GLOBAL_CONSTANTS = {
    ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT_MODE,
    URL: {
        API_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
        API_VERSION: process.env.EXPO_PUBLIC_APP_API_VERSION,
        CLIENT_URL: process.env.EXPO_PUBLIC_CLIENT_URL
    }
};

const CONFIGS = GLOBAL_CONSTANTS;

export { NODE_ENV, CONFIGS };
