const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude the Next.js web app from Metro bundling
config.resolver.blockList = [
  /apps\/web\/.*/,
  /node_modules\/next\/.*/,
];

module.exports = config;
