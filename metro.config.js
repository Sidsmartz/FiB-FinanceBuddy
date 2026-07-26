const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .glb and .gltf 3D assets
config.resolver.assetExts.push('glb', 'gltf', 'bin');

// Strip console.log calls from production bundles (req 5.4)
// Metro uses Terser under the hood; dropConsole removes all console.* calls.
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    compress: {
      ...config.transformer?.minifierConfig?.compress,
      drop_console: true,
    },
  },
};

module.exports = config;
