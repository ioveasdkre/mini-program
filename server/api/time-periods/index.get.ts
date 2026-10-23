export default defineEventHandler(async event => {
  await requireAllowedUser(event);
  return listTimePeriods(await useDb());
});
