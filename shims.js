// Must be imported before THREE in App.js
if (typeof global.document === 'undefined') {
  global.document = {
    createElementNS: (_ns, tag) =>
      tag === 'canvas' ? { getContext: () => null, style: {} } : { style: {} },
    createElement: () => ({ style: {} }),
    body: { appendChild: () => {} },
  };
}
if (typeof global.window === 'undefined') global.window = global;
if (typeof global.navigator === 'undefined') global.navigator = { userAgent: 'react-native' };
if (typeof global.URL === 'undefined') {
  global.URL = { createObjectURL: () => '', revokeObjectURL: () => {} };
}
if (typeof global.Blob === 'undefined') {
  global.Blob = class Blob { constructor(parts) { this._parts = parts; } };
}
