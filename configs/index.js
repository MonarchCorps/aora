import Constants from 'expo-constants'

const MODE_ENV = Constants.expoConfig.extra.modeEnv || "development";

const GLOBAL_CONSTANTS = {
    ENVIRONMENT: Constants.expoConfig.extra.environmentMode,
    URL: {
        API_BASE_URL: Constants.expoConfig.extra.baseUrl,
        API_VERSION: Constants.expoConfig.extra.apiVersion,
        CLIENT_URL: Constants.expoConfig.extra.clientUrl
    },
    LIMIT: Constants.expoConfig.extra.trendingPostsLimit
};

const CONFIGS = GLOBAL_CONSTANTS;

export { MODE_ENV, CONFIGS };
