/**
 * Widget task handler — registered with react-native-android-widget.
 * Handles WIDGET_ADDED, WIDGET_UPDATE, WIDGET_RESIZED, and WIDGET_CLICK actions.
 *
 * The library's registerWidgetTaskHandler injects renderWidget as a PROP
 * into the handler — it is NOT importable from the library.
 */
import React from 'react';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FiBWidgetPreview from './FiBWidgetPreview';

const WIDGET_BALANCE_KEY = 'fibWidgetBalance';

async function readWidgetBalance() {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_BALANCE_KEY);
    if (raw !== null) return { balance: JSON.parse(raw), hasError: false };
    return { balance: 0, hasError: false };
  } catch {
    return { balance: 0, hasError: true };
  }
}

/**
 * The task handler invoked by the Android widget framework.
 * `renderWidget` is provided by the library as a prop — NOT imported.
 */
async function widgetTaskHandler({ widgetAction, widgetInfo, renderWidget }) {
  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const { balance, hasError } = await readWidgetBalance();
      renderWidget(<FiBWidgetPreview balance={balance} hasError={hasError} />);
      break;
    }

    case 'WIDGET_CLICK':
      // clickAction = 'OPEN_URI' is handled natively by the library.
      // No JS work needed here.
      break;

    case 'WIDGET_DELETED':
    default:
      break;
  }
}

registerWidgetTaskHandler(widgetTaskHandler);

export { widgetTaskHandler, readWidgetBalance };
