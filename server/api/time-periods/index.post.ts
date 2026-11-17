export default defineEventHandler(async event => {
  const user = await requireAllowedUser(event);
  const body = asRecord(await readBody(event));

  const periodStart = asIsoDate(body['periodStart'], '週期起始日');
  const name =
    body['name'] === undefined || body['name'] === null || body['name'] === ''
      ? null
      : asText(body['name'], '名稱', 50);

  const db = await useDb();
  await db.execute({
    sql: 'INSERT INTO time_period_saves (period_start, name, created_by) VALUES (?, ?, ?)',
    args: [periodStart, name, user.email],
  });
  return listTimePeriods(db);
});
