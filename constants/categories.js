/**
 * Single source of truth for expense categories and their chart colors.
 * Import from here in all screens and the widget.
 */

export const CATEGORIES = [
  'Books',
  'Food',
  'Gifts',
  'Movies',
  'Groceries',
  'Transport',
  'Entertainment',
  'Others',
];

/** Map of category name → hex color (used in pie charts and category chips) */
export const CATEGORY_COLORS = {
  Books:         '#7eb8ff',
  Food:          '#5a9eff',
  Gifts:         '#3d84ff',
  Movies:        '#2069ff',
  Groceries:     '#1a5fd9',
  Transport:     '#1450b3',
  Entertainment: '#0e408c',
  Others:        '#083066',
};

/**
 * Returns the COLORS array in the same order as CATEGORIES,
 * for libraries (react-native-chart-kit) that expect a parallel array.
 */
export const CATEGORY_COLORS_ARRAY = CATEGORIES.map(c => CATEGORY_COLORS[c]);
