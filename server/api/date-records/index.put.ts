import type { InStatement } from '@libsql/client/web';

const UPSERT_SQL = `INSERT INTO date_ranges
  (id, title, start_date, end_mode, end_date, include_start_day, created_by, updated_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    start_date = excluded.start_date,
    end_mode = excluded.end_mode,
    end_date = excluded.end_date,
    include_start_day = excluded.include_start_day,
    updated_by = excluded.updated_by,
    updated_at = datetime('now')`;

// 只送出本次的變更與刪除，避免覆蓋其他人新增的資料
export default defineEventHandler(async event => {
  const user = await requireAllowedUser(event);
  const body = asRecord(await readBody(event));

  const records = asArray(body['records'], '記錄', 200).map(item => {
    const record = asRecord(item, '日期範圍');
    const title = asText(record['title'], '名稱', 50);
    const startDate = asIsoDate(record['startDate'], '起始日');
    const endMode = asOneOf(record['endMode'], '結束日模式', ['fixed', 'today'] as const);
    const endDate = endMode === 'fixed' ? asIsoDate(record['endDate'], '結束日') : null;
    if (endDate !== null && endDate < startDate) {
      throw createError({ statusCode: 400, message: '結束日不可早於起始日' });
    }
    const includeStartDay = asBoolean(record['includeStartDay'], '是否計入起始當天');
    const id =
      record['id'] === undefined || record['id'] === null
        ? null
        : asNumber(record['id'], '編號', 1, Number.MAX_SAFE_INTEGER, true);
    return { id, title, startDate, endMode, endDate, includeStartDay };
  });

  const deletedIds = asArray(body['deletedIds'], '刪除清單', 200).map(value =>
    asNumber(value, '刪除編號', 1, Number.MAX_SAFE_INTEGER, true),
  );

  const statements: InStatement[] = [
    ...deletedIds.map(id => ({ sql: 'DELETE FROM date_ranges WHERE id = ?', args: [id] })),
    ...records.map(record => ({
      sql: UPSERT_SQL,
      args: [
        record.id,
        record.title,
        record.startDate,
        record.endMode,
        record.endDate,
        record.includeStartDay ? 1 : 0,
        user.email,
        user.email,
      ],
    })),
  ];

  const db = await useDb();
  if (statements.length > 0) {
    await db.batch(statements, 'write');
  }
  return listDateRecords(db);
});
