export default defineEventHandler(async event => {
  await requireAllowedUser(event);
  const id = asRouteId(event);

  const db = await useDb();
  await db.execute({ sql: 'DELETE FROM time_period_saves WHERE id = ?', args: [id] });
  return listTimePeriods(db);
});
