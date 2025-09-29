import { ExpoConfig } from '@expo/config-types';

export default ({ config }: { config: ExpoConfig }) => ({
    ...config,
    extra: {
        API_BASE_URL: process.env.API_BASE_URL,
        API_NAMESPACE_V1: process.env.API_NAMESPACE_V1,
        API_NAMESPACE_V2: process.env.API_NAMESPACE_V2,
        FRONTEND_REDIRECT_URI: process.env.NEXT_PUBLIC_API_FRONTEND_REDIRECT_URI,
        eas: {
            projectId: "e16ac642-58b3-49c4-904b-5b7b5c9caf30",
        },
    },
});