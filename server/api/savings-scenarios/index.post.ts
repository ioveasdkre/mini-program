export default defineEventHandler(async event => {
  const user = await requireAllowedUser(event);
  const input = parseSavingsScenarioInput(await readBody(event));

  const db = await useDb();
  await db.execute({
    sql: `INSERT INTO savings_scenarios
      (name, initial_amount, monthly_deposit, annual_rate, years, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.name,
      input.initialAmount,
      input.monthlyDeposit,
      input.annualRate,
      input.years,
      user.email,
      user.email,
    ],
  });
  return listSavingsScenarios(db);
});
