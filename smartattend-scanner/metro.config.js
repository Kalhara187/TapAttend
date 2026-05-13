const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-gesture-handler': path.resolve(__dirname, 'shims/react-native-gesture-handler.js'),
};

module.exports = config;
