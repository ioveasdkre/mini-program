export default defineEventHandler(async event => {
  await requireAllowedUser(event);
  return listSavingsScenarios(await useDb());
});
