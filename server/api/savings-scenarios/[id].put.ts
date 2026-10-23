export default defineEventHandler(async event => {
  const user = await requireAllowedUser(event);
  const id = asRouteId(event);
  const input = parseSavingsScenarioInput(await readBody(event));

  const db = await useDb();
  const result = await db.execute({
    sql: `UPDATE savings_scenarios SET
      name = ?, initial_amount = ?, monthly_deposit = ?, annual_rate = ?, years = ?,
      updated_by = ?, updated_at = datetime('now')
      WHERE id = ?`,
    args: [
      input.name,
      input.initialAmount,
      input.monthlyDeposit,
      input.annualRate,
      input.years,
      user.email,
      id,
    ],
  });
  if (result.rowsAffected === 0) {
    throw createError({ statusCode: 404, message: '找不到此方案，可能已被刪除' });
  }
  return listSavingsScenarios(db);
});
