export default defineEventHandler(async event => {
  await requireAllowedUser(event);
  return listDateRecords(await useDb());
});
