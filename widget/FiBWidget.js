/**
 * Widget task handler — registered with react-native-android-widget.
 * Handles WIDGET_ADDED, WIDGET_UPDATE, WIDGET_RESIZED, and WIDGET_CLICK actions.
 *
 * The library's registerWidgetTaskHandler injects renderWidget as a PROP
 * into the handler — it is NOT importable from the library.
 */
import React from 'react';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import * as SQLite from 'expo-sqlite';
import FiBWidgetPreview from './FiBWidgetPreview';

function readSpentToday() {
  try {
    const db = SQLite.openDatabaseSync('fib.db');
    const today = new Date();
    const todayPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const row = db.getFirstSync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE ?`,
      [`${todayPrefix}%`],
    );
    return { spentToday: row ? row.total : 0, hasError: false };
  } catch {
    return { spentToday: 0, hasError: true };
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
      const { spentToday, hasError } = readSpentToday();
      renderWidget(<FiBWidgetPreview spentToday={spentToday} hasError={hasError} />);
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

export { widgetTaskHandler, readSpentToday };
