/**
 * Tests for utils/db.js — SQLite initialisation + migration logic.
 * Property-based tests use fast-check.
 * Requirements: 1.1, 1.2, 1.3, 1.5, 1.6
 */

const fc = require('fast-check');

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock expo-sqlite so the module can be required in a Node test environment.
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDb()),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  clear: jest.fn(async () => {}),
}));

function mockDb(metaStore = {}) {
  const store = { ...metaStore };
  const tables = { expenses: [], budgets: [], income_flows: [], savings: [], savings_goals: [], meta: [] };
  const insertedRows = { expenses: 0, budgets: 0, income_flows: 0, savings: 0, savings_goals: 0 };

  return {
    execSync: jest.fn(),
    getFirstSync: jest.fn((sql, params) => {
      const key = params[0];
      return store[key] !== undefined ? { value: store[key] } : null;
    }),
    runSync: jest.fn((sql, params) => {
      // Track INSERT OR IGNORE / INSERT OR REPLACE into tables
      const lower = sql.toLowerCase();
      if (lower.includes('insert') && lower.includes('into expenses')) insertedRows.expenses++;
      if (lower.includes('insert') && lower.includes('into savings ')) insertedRows.savings++;
      if (lower.includes('insert') && lower.includes('into savings_goals')) insertedRows.savings_goals++;
      if (lower.includes('insert') && lower.includes('into income_flows')) insertedRows.income_flows++;
      if (lower.includes('insert') && lower.includes('into meta')) {
        store[params[0]] = params[1];
      }
    }),
    _insertedRows: insertedRows,
    _store: store,
  };
}

// We need to re-require db.js after mocks are in place.
// Use a factory so each test gets a fresh require context via jest.isolateModules.
async function getDb() {
  let mod;
  jest.isolateModules(() => {
    mod = require('../utils/db');
  });
  return mod;
}

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe('getMeta / setMeta', () => {
  test('getMeta returns null for absent key', async () => {
    const { getMeta } = await getDb();
    const db = mockDb({});
    expect(getMeta(db, 'missing')).toBeNull();
  });

  test('getMeta returns stored value', async () => {
    const { getMeta } = await getDb();
    const db = mockDb({ myKey: 'hello' });
    expect(getMeta(db, 'myKey')).toBe('hello');
  });

  test('setMeta calls runSync with INSERT OR REPLACE', async () => {
    const { setMeta } = await getDb();
    const db = mockDb({});
    setMeta(db, 'foo', 'bar');
    expect(db.runSync).toHaveBeenCalledWith(
      expect.stringMatching(/INSERT OR REPLACE/i),
      ['foo', 'bar'],
    );
  });
});

describe('runMigrationIfNeeded — already migrated', () => {
  test('returns immediately without reading AsyncStorage when migrated=1', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockClear();

    const { runMigrationIfNeeded, getMeta } = await getDb();
    // Provide a db where meta('migrated') === '1'
    const db = mockDb({ migrated: '1' });

    await runMigrationIfNeeded(db);

    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    // No new rows should have been inserted
    expect(db._insertedRows.expenses).toBe(0);
    expect(db._insertedRows.savings).toBe(0);
    expect(db._insertedRows.savings_goals).toBe(0);
    expect(db._insertedRows.income_flows).toBe(0);
  });
});

describe('runMigrationIfNeeded — first run with data', () => {
  test('inserts AsyncStorage records into SQLite tables', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const payload = {
      expenses: [
        { id: 'e1', title: 'Coffee', amount: 50, category: 'food', date: '2026-08-01T10:00:00Z', split: 0 },
      ],
      savings: [
        { id: 's1', title: 'Emergency', amount: 500, date: '2026-08-01T00:00:00Z', goalId: null },
      ],
      savingsGoals: [
        { id: 'g1', name: 'Trip', target: 10000, current: 500 },
      ],
      incomeFlows: [
        { id: 'i1', source: 'Salary', amount: 30000, recurring: 1, frequency: 'monthly' },
      ],
      balance: 5000,
      emergencySavings: 1000,
    };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(payload));

    const { runMigrationIfNeeded } = await getDb();
    const db = mockDb({}); // migrated key absent

    await runMigrationIfNeeded(db);

    expect(db._insertedRows.expenses).toBe(1);
    expect(db._insertedRows.savings).toBe(1);
    expect(db._insertedRows.savings_goals).toBe(1);
    expect(db._insertedRows.income_flows).toBe(1);
    // migrated flag was set
    expect(db._store['migrated']).toBe('1');
    expect(AsyncStorage.clear).toHaveBeenCalled();
  });

  test('sets migrated=1 even when AsyncStorage is empty', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    AsyncStorage.clear.mockClear();

    const { runMigrationIfNeeded } = await getDb();
    const db = mockDb({});

    await runMigrationIfNeeded(db);

    expect(db._store['migrated']).toBe('1');
    expect(AsyncStorage.clear).toHaveBeenCalled();
  });

  test('sets migrated=1 and clears even when parse fails (Req 1.6)', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValueOnce('INVALID JSON {{{');
    AsyncStorage.clear.mockClear();

    const { runMigrationIfNeeded } = await getDb();
    const db = mockDb({});

    await runMigrationIfNeeded(db);

    expect(db._store['migrated']).toBe('1');
    expect(db._insertedRows.expenses).toBe(0);
  });
});

// ─── Property 10 ─────────────────────────────────────────────────────────────
// Feature: fib-v2, Property 10: Migration idempotence
// Validates: Requirements 1.2, 1.3
describe('Property 10: Migration idempotence', () => {
  test(
    'For any DB state where meta(migrated) is already "1", runMigrationIfNeeded inserts no rows',
    async () => {
      // Generate random AsyncStorage payloads that might be returned
      const expenseArb = fc.record({
        id: fc.string({ minLength: 1, maxLength: 10 }),
        title: fc.string(),
        amount: fc.double({ min: 0.01, max: 10000, noNaN: true }),
        category: fc.string(),
        date: fc.constant(new Date().toISOString()),
        split: fc.constant(0),
      });

      const payloadArb = fc.record({
        expenses: fc.array(expenseArb, { minLength: 0, maxLength: 5 }),
        savings: fc.array(fc.object(), { maxLength: 3 }),
        savingsGoals: fc.array(fc.object(), { maxLength: 3 }),
        incomeFlows: fc.array(fc.object(), { maxLength: 3 }),
        balance: fc.double({ min: 0, max: 100000, noNaN: true }),
        emergencySavings: fc.double({ min: 0, max: 100000, noNaN: true }),
      });

      await fc.assert(
        fc.asyncProperty(payloadArb, async (payload) => {
          const AsyncStorage = require('@react-native-async-storage/async-storage');
          // Reset mock state before each iteration
          AsyncStorage.getItem.mockClear();
          AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(payload));
          AsyncStorage.clear.mockClear();

          const { runMigrationIfNeeded } = await getDb();
          // DB already has migrated='1'
          const db = mockDb({ migrated: '1' });
          const rowsBefore = { ...db._insertedRows };

          await runMigrationIfNeeded(db);

          // No new rows inserted into any table
          expect(db._insertedRows.expenses).toBe(rowsBefore.expenses);
          expect(db._insertedRows.savings).toBe(rowsBefore.savings);
          expect(db._insertedRows.savings_goals).toBe(rowsBefore.savings_goals);
          expect(db._insertedRows.income_flows).toBe(rowsBefore.income_flows);
          // AsyncStorage was NOT read
          expect(AsyncStorage.getItem).not.toHaveBeenCalled();
        }),
        { numRuns: 100 },
      );
    },
  );
});
