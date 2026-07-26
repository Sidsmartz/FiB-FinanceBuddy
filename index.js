// These shims MUST run before any Three.js import
// Using require() so execution order is guaranteed
if (typeof global.document === 'undefined') {
  global.document = {
    createElementNS: (_ns, tag) =>
      tag === 'canvas' ? { getContext: () => null, style: {} } : { style: {} },
    createElement: () => ({ style: {} }),
  };
}
if (typeof global.window === 'undefined') global.window = global;
if (typeof global.URL === 'undefined') {
  global.URL = { createObjectURL: () => '', revokeObjectURL: () => {} };
}

const { registerRootComponent } = require('expo');
const { default: App } = require('./App');

// Register the Android widget task handler so it is available
// when Android wakes the JS runtime to update the widget (req 2.1, 2.4)
require('./widget/FiBWidget');

registerRootComponent(App);
