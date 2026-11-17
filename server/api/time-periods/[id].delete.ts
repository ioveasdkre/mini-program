export default defineEventHandler(async event => {
  await requireAllowedUser(event);
  const id = asRouteId(event);

  const db = await useDb();
  const result = await db.execute({
    sql: 'DELETE FROM time_period_saves WHERE id = ? AND locked = 0',
    args: [id],
  });
  if (result.rowsAffected === 0) {
    const found = await db.execute({
      sql: 'SELECT locked FROM time_period_saves WHERE id = ?',
      args: [id],
    });
    if (found.rows.length > 0) {
      throw createError({ statusCode: 403, message: '此週期已鎖定，無法刪除' });
    }
  }
  return listTimePeriods(db);
});
