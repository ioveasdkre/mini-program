import type { Client } from '@libsql/client/web';
import type { TimePeriodSaveDto } from '~~/shared/types/api';

export const listTimePeriods = async (db: Client): Promise<TimePeriodSaveDto[]> => {
  const result = await db.execute(
    'SELECT id, period_start, name, created_by, created_at FROM time_period_saves ORDER BY period_start DESC, id DESC',
  );
  return result.rows.map(row => ({
    id: Number(row['id']),
    periodStart: String(row['period_start']),
    name: row['name'] === null ? null : String(row['name']),
    createdBy: String(row['created_by']),
    createdAt: String(row['created_at']),
  }));
};
