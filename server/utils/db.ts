import { createClient, type Client } from '@libsql/client/web';

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS date_ranges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_mode TEXT NOT NULL CHECK (end_mode IN ('fixed', 'today')),
    end_date TEXT,
    include_start_day INTEGER NOT NULL DEFAULT 1 CHECK (include_start_day IN (0, 1)),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (end_mode = 'today' OR (end_date IS NOT NULL AND end_date >= start_date))
  )`,
  `CREATE TABLE IF NOT EXISTS time_period_saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_start TEXT NOT NULL,
    name TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS savings_scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    initial_amount REAL NOT NULL DEFAULT 0,
    monthly_deposit REAL NOT NULL DEFAULT 0,
    annual_rate REAL NOT NULL,
    years INTEGER NOT NULL CHECK (years BETWEEN 1 AND 100),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
];

let ready: Promise<Client> | undefined;

const initDb = async (): Promise<Client> => {
  const url = process.env['TURSO_DATABASE_URL'];
  if (!url) {
    throw createError({ statusCode: 500, message: '資料庫尚未設定' });
  }

  // web 版客戶端只支援 HTTP，需把 libsql:// 轉為 https://
  const db = createClient({
    url: url.replace(/^libsql:/, 'https:'),
    authToken: process.env['TURSO_AUTH_TOKEN'],
  });
  await db.batch(SCHEMA, 'write');
  return db;
};

export const useDb = (): Promise<Client> => {
  ready ??= initDb().catch((error: unknown) => {
    ready = undefined;
    throw error;
  });
  return ready;
};
