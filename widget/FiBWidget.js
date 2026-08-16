/**
 * Widget task handler — registered with react-native-android-widget.
 * Handles WIDGET_ADDED, WIDGET_UPDATE, and the LOG_EXPENSE click action.
 * Requirements: 2.1, 2.3, 2.4, 2.5
 */
import React from 'react';
import { registerWidgetTaskHandler, renderWidget } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FiBWidgetPreview from './FiBWidgetPreview';

const WIDGET_BALANCE_KEY = 'fibWidgetBalance';

/**
 * Reads the widget balance from AsyncStorage.
 * Falls back to 0 on error (req 2.5) and flags hasError.
 */
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
 * Renders the widget with the current balance.
 * Called on WIDGET_ADDED and WIDGET_UPDATE.
 */
async function renderFiBWidget(widgetInfo) {
  const { balance, hasError } = await readWidgetBalance();
  await renderWidget({
    widgetName: 'FiBWidget',
    widgetInfo,
    widgetProvider: () => (
      <FiBWidgetPreview balance={balance} hasError={hasError} />
    ),
  });
}

/**
 * The task handler invoked by the Android widget framework.
 */
async function widgetTaskHandler(props) {
  const { widgetAction, widgetInfo } = props;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      await renderFiBWidget(widgetInfo);
      break;

    case 'OPEN_QUICK_LOG':
      // The TouchableWidget click action — Android will launch the activity
      // registered under the OPEN_QUICK_LOG intent; no JS work needed here.
      break;

    default:
      break;
  }
}

registerWidgetTaskHandler(widgetTaskHandler);

export { widgetTaskHandler, readWidgetBalance };
