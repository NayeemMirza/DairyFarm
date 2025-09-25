const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    lodash: require.resolve("lodash"),
};

module.exports = withNativeWind(config, { input: './app/global.css' })