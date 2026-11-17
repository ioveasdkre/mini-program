// 最高權限管理員切換鎖定狀態（解鎖後才能刪除）
export default defineEventHandler(async event => {
  await requireSuperAdmin(event);
  const id = asRouteId(event);
  const body = asRecord(await readBody(event));
  const locked = asBoolean(body['locked'], '鎖定');

  const db = await useDb();
  const result = await db.execute({
    sql: 'UPDATE time_period_saves SET locked = ? WHERE id = ?',
    args: [locked ? 1 : 0, id],
  });
  if (result.rowsAffected === 0) {
    throw createError({ statusCode: 404, message: '找不到此週期' });
  }
  return listTimePeriods(db);
});
