module.exports = (api) => {
  // Use the lighter preset-env for Jest; Expo preset for bundler
  if (api.env('test')) {
    return {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    };
  }
  return {
    presets: ['babel-preset-expo'],
  };
};
