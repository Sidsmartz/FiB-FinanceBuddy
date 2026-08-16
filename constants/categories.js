/**
 * Single source of truth for expense categories and their chart colors.
 * Import from here in all screens and the widget.
 */

export const DEFAULT_CATEGORIES = [
  { id: 'food',          label: 'Food',          icon: 'fast-food-outline' },
  { id: 'groceries',     label: 'Groceries',     icon: 'cart-outline' },
  { id: 'transport',     label: 'Transport',     icon: 'car-outline' },
  { id: 'health',        label: 'Health',        icon: 'medkit-outline' },
  { id: 'shopping',      label: 'Shopping',      icon: 'bag-outline' },
  { id: 'entertainment', label: 'Entertainment', icon: 'game-controller-outline' },
  { id: 'movies',        label: 'Movies',        icon: 'film-outline' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'repeat-outline' },
  { id: 'utilities',     label: 'Utilities',     icon: 'flash-outline' },
  { id: 'education',     label: 'Education',     icon: 'school-outline' },
  { id: 'emi',           label: 'EMI',           icon: 'card-outline' },
  { id: 'gifts',         label: 'Gifts',         icon: 'gift-outline' },
  { id: 'others',        label: 'Others',        icon: 'ellipsis-horizontal-outline' },
];

/** Map of category id → hex color (used in pie charts and category chips) */
export const CATEGORY_COLORS = {
  food:          '#7eb8ff',
  groceries:     '#5a9eff',
  transport:     '#3d84ff',
  health:        '#2069ff',
  shopping:      '#1a5fd9',
  entertainment: '#1450b3',
  movies:        '#0e408c',
  subscriptions: '#083066',
  utilities:     '#4ade80',
  education:     '#22c55e',
  emi:           '#16a34a',
  gifts:         '#ff6b6b',
  others:        '#444444',
};

/**
 * Returns the color for a given category id or label.
 * Falls back to '#444444' for unknown / custom categories.
 */
export function getCategoryColor(categoryId) {
  return CATEGORY_COLORS[categoryId] || CATEGORY_COLORS[categoryId?.toLowerCase()] || '#444444';
}

/**
 * Legacy CATEGORIES array — kept for backward compatibility with any code
 * that still imports it directly. New code should use DEFAULT_CATEGORIES.
 */
export const CATEGORIES = DEFAULT_CATEGORIES.map(c => c.label);

/**
 * Returns the COLORS array in the same order as DEFAULT_CATEGORIES,
 * for libraries (react-native-chart-kit) that expect a parallel array.
 */
export const CATEGORY_COLORS_ARRAY = DEFAULT_CATEGORIES.map(c => CATEGORY_COLORS[c.id] || '#444444');
