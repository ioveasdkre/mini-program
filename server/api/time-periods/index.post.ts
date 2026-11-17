export default defineEventHandler(async event => {
  const user = await requireAllowedUser(event);
  const body = asRecord(await readBody(event));

  const periodStart = asIsoDate(body['periodStart'], '週期起始日');
  const name =
    body['name'] === undefined || body['name'] === null || body['name'] === ''
      ? null
      : asText(body['name'], '名稱', 50);

  let locked = false;
  if (body['locked'] !== undefined) {
    locked = asBoolean(body['locked'], '鎖定');
    if (locked && !isSuperAdminEmail(user.email)) {
      throw createError({ statusCode: 403, message: '只有最高權限可以設定鎖定' });
    }
  }

  const db = await useDb();
  await db.execute({
    sql: 'INSERT INTO time_period_saves (period_start, name, locked, created_by) VALUES (?, ?, ?, ?)',
    args: [periodStart, name, locked ? 1 : 0, user.email],
  });
  return listTimePeriods(db);
});
