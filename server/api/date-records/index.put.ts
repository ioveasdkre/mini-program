import type { InStatement } from '@libsql/client/web';

const UPSERT_SQL = `INSERT INTO date_ranges
  (id, title, note, sort_order, start_mode, start_date, end_mode, end_date, include_start_day, locked, created_by, updated_by)
  VALUES (?, ?, ?, COALESCE(?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM date_ranges)), ?, ?, ?, ?, ?, COALESCE(?, 0), ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    note = excluded.note,
    sort_order = COALESCE(?, sort_order),
    start_mode = excluded.start_mode,
    start_date = excluded.start_date,
    end_mode = excluded.end_mode,
    end_date = excluded.end_date,
    include_start_day = excluded.include_start_day,
    locked = COALESCE(?, locked),
    updated_by = excluded.updated_by,
    updated_at = datetime('now')`;

// 只送出本次的變更與刪除，避免覆蓋其他人新增的資料
export default defineEventHandler(async event => {
  const user = await requireAllowedUser(event);
  const isSuperAdmin = isSuperAdminEmail(user.email);
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
    // 非最高權限送出的鎖定值一律忽略（null = 新增時為否、更新時維持原值）
    const locked =
      isSuperAdmin && record['locked'] !== undefined && record['locked'] !== null
        ? asBoolean(record['locked'], '鎖定')
        : null;
    return {
      id,
      title,
      note,
      sortOrder,
      startMode,
      startDate,
      endMode,
      endDate,
      includeStartDay,
      locked,
    };
  });

  const deletedIds = asArray(body['deletedIds'], '刪除清單', 200).map(value =>
    asNumber(value, '刪除編號', 1, Number.MAX_SAFE_INTEGER, true),
  );

  const db = await useDb();

  if (deletedIds.length > 0) {
    const lockedRows = await db.execute({
      sql: `SELECT id FROM date_ranges WHERE locked = 1 AND id IN (${deletedIds.map(() => '?').join(', ')})`,
      args: deletedIds,
    });
    if (lockedRows.rows.length > 0) {
      throw createError({ statusCode: 403, message: '此記錄已鎖定，無法刪除' });
    }
  }

  const statements: InStatement[] = [
    // 再加 locked = 0 條件，避免檢查後到執行前被鎖定
    ...deletedIds.map(id => ({
      sql: 'DELETE FROM date_ranges WHERE id = ? AND locked = 0',
      args: [id],
    })),
    ...records.map(record => {
      const locked = record.locked === null ? null : record.locked ? 1 : 0;
      return {
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
          locked,
          user.email,
          user.email,
          record.sortOrder,
          locked,
        ],
      };
    }),
  ];

  if (statements.length > 0) {
    await db.batch(statements, 'write');
  }
  return listDateRecords(db);
});
