/**
 * utils/db.js — SQLite database initialisation and migration helpers.
 * Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 5.2
 */
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_NAME = 'fib.db';

// ─── DDL ─────────────────────────────────────────────────────────────────────

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT,
  amount REAL,
  category TEXT,
  date TEXT,
  split INTEGER DEFAULT 0,
  split_with TEXT,
  is_recurring INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  category TEXT,
  monthly_limit REAL,
  month TEXT
);

CREATE TABLE IF NOT EXISTS income_flows (
  id TEXT PRIMARY KEY,
  source TEXT,
  amount REAL,
  expected_date TEXT,
  recurring INTEGER DEFAULT 0,
  frequency TEXT,
  auto_add INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  savings_alloc REAL DEFAULT 0,
  spend_alloc REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS savings (
  id TEXT PRIMARY KEY,
  title TEXT,
  amount REAL,
  date TEXT,
  goal_id TEXT
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  name TEXT,
  target REAL,
  current REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE INDEX IF NOT EXISTS idx_exp_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_exp_cat  ON expenses(category);
`;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Opens (or creates) the SQLite database and runs all CREATE TABLE / INDEX
 * statements. Safe to call multiple times — all statements are IF NOT EXISTS.
 * Requirements: 1.1, 1.5
 * @returns {SQLite.SQLiteDatabase}
 */
export function initDB() {
  const db = SQLite.openDatabaseSync(DB_NAME);
  db.execSync(CREATE_TABLES_SQL);
  return db;
}

/**
 * Reads a value from the meta key-value table.
 * Returns null when the key is absent.
 * Requirements: 1.2, 5.2
 * @param {SQLite.SQLiteDatabase} db
 * @param {string} key
 * @returns {string | null}
 */
export function getMeta(db, key) {
  const row = db.getFirstSync('SELECT value FROM meta WHERE key = ?', [key]);
  return row ? row.value : null;
}

/**
 * Inserts or replaces a value in the meta table.
 * Requirements: 1.2, 5.2
 * @param {SQLite.SQLiteDatabase} db
 * @param {string} key
 * @param {string} value
 */
export function setMeta(db, key, value) {
  db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', [key, String(value)]);
}

// ─── Migration ────────────────────────────────────────────────────────────────

/**
 * One-time migration from AsyncStorage → SQLite.
 * If meta('migrated') is already '1', returns immediately (idempotent).
 * On any read/parse error, logs and continues — DB remains empty rather than crashing.
 * Requirements: 1.2, 1.3, 1.6
 * @param {SQLite.SQLiteDatabase} db
 * @returns {Promise<void>}
 */
export async function runMigrationIfNeeded(db) {
  if (getMeta(db, 'migrated') === '1') {
    return;
  }

  try {
    const raw = await AsyncStorage.getItem('financeData');
    if (raw) {
      const data = JSON.parse(raw);
      _migrateExpenses(db, data.expenses);
      _migrateSavings(db, data.savings);
      _migrateSavingsGoals(db, data.savingsGoals);
      _migrateIncomeFlows(db, data.incomeFlows);
      _migrateBalanceHistory(db, data.balanceHistory);
      _migrateMeta(db, data);
    }
  } catch (err) {
    console.error('[FiB] Migration read/parse failed — continuing with empty DB:', err);
  }

  setMeta(db, 'migrated', '1');

  try {
    await AsyncStorage.clear();
  } catch (err) {
    console.error('[FiB] AsyncStorage.clear() failed after migration:', err);
  }
}

// ─── Private migration helpers ────────────────────────────────────────────────

function _migrateExpenses(db, expenses) {
  if (!Array.isArray(expenses)) return;
  for (const e of expenses) {
    try {
      db.runSync(
        `INSERT OR IGNORE INTO expenses (id, title, amount, category, date, split, split_with, is_recurring)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          e.id ?? String(Date.now()),
          e.title ?? '',
          e.amount ?? 0,
          e.category ?? '',
          e.date ?? new Date().toISOString(),
          e.split ? 1 : 0,
          e.splitWith ?? null,
          e.isRecurring ? 1 : 0,
        ],
      );
    } catch (err) {
      console.error('[FiB] Failed to migrate expense:', e.id, err);
    }
  }
}

function _migrateSavings(db, savings) {
  if (!Array.isArray(savings)) return;
  for (const s of savings) {
    try {
      db.runSync(
        `INSERT OR IGNORE INTO savings (id, title, amount, date, goal_id) VALUES (?, ?, ?, ?, ?)`,
        [s.id ?? String(Date.now()), s.title ?? '', s.amount ?? 0, s.date ?? '', s.goalId ?? null],
      );
    } catch (err) {
      console.error('[FiB] Failed to migrate saving:', s.id, err);
    }
  }
}

function _migrateSavingsGoals(db, goals) {
  if (!Array.isArray(goals)) return;
  for (const g of goals) {
    try {
      db.runSync(
        `INSERT OR IGNORE INTO savings_goals (id, name, target, current) VALUES (?, ?, ?, ?)`,
        [g.id ?? String(Date.now()), g.name ?? '', g.target ?? 0, g.current ?? 0],
      );
    } catch (err) {
      console.error('[FiB] Failed to migrate savings goal:', g.id, err);
    }
  }
}

function _migrateIncomeFlows(db, flows) {
  if (!Array.isArray(flows)) return;
  for (const f of flows) {
    try {
      db.runSync(
        `INSERT OR IGNORE INTO income_flows
         (id, source, amount, expected_date, recurring, frequency, auto_add, completed, savings_alloc, spend_alloc)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          String(f.id ?? Date.now()),
          f.source ?? '',
          f.amount ?? 0,
          f.expectedDate ?? null,
          f.recurring ? 1 : 0,
          f.frequency ?? null,
          f.autoAdd ? 1 : 0,
          f.completed ? 1 : 0,
          f.savingsAlloc ?? 0,
          f.spendAlloc ?? 0,
        ],
      );
    } catch (err) {
      console.error('[FiB] Failed to migrate income flow:', f.id, err);
    }
  }
}

function _migrateBalanceHistory(db, history) {
  // balanceHistory is stored in AsyncStorage but has no dedicated table in v2;
  // it was tracked via addBalance calls. We persist balance + emergency_savings
  // into meta from the top-level data object instead.
  // Individual history entries are not migrated to a separate table.
}

function _migrateMeta(db, data) {
  if (typeof data.balance === 'number' && isFinite(data.balance)) {
    setMeta(db, 'balance', String(data.balance));
  }
  if (typeof data.emergencySavings === 'number' && isFinite(data.emergencySavings)) {
    setMeta(db, 'emergency_savings', String(data.emergencySavings));
  }
}
