import type { InStatement } from '@libsql/client/web';

const UPSERT_SQL = `INSERT INTO date_ranges
  (id, title, note, sort_order, start_mode, start_date, end_mode, end_date, include_start_day, created_by, updated_by)
  VALUES (?, ?, ?, COALESCE(?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM date_ranges)), ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    note = excluded.note,
    sort_order = COALESCE(?, sort_order),
    start_mode = excluded.start_mode,
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
    const rawNote = record['note'];
    const note =
      rawNote === undefined || rawNote === null || rawNote === ''
        ? ''
        : asText(rawNote, '備註', 200);
    const sortOrder =
      record['sortOrder'] === undefined || record['sortOrder'] === null
        ? null
        : asNumber(record['sortOrder'], '排序', 0, Number.MAX_SAFE_INTEGER, true);
    const startMode = asOneOf(record['startMode'], '起始日模式', ['fixed', 'today'] as const);
    const endMode = asOneOf(record['endMode'], '結束日模式', ['fixed', 'today'] as const);
    const endDate = endMode === 'fixed' ? asIsoDate(record['endDate'], '結束日') : null;
    // 起始日永遠為今天時，備用值取結束日，才能滿足資料表的 end_date >= start_date 檢查
    const startDate =
      startMode === 'today' && endDate !== null
        ? endDate
        : asIsoDate(record['startDate'], '起始日');
    if (endDate !== null && endDate < startDate) {
      throw createError({ statusCode: 400, message: '結束日不可早於起始日' });
    }
    const includeStartDay = asBoolean(record['includeStartDay'], '是否計入起始當天');
    const id =
      record['id'] === undefined || record['id'] === null
        ? null
        : asNumber(record['id'], '編號', 1, Number.MAX_SAFE_INTEGER, true);
    return { id, title, note, sortOrder, startMode, startDate, endMode, endDate, includeStartDay };
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
        record.note,
        record.sortOrder,
        record.startMode,
        record.startDate,
        record.endMode,
        record.endDate,
        record.includeStartDay ? 1 : 0,
        user.email,
        user.email,
        record.sortOrder,
      ],
    })),
  ];

  const db = await useDb();
  if (statements.length > 0) {
    await db.batch(statements, 'write');
  }
  return listDateRecords(db);
});
