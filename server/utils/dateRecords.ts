import type { Client } from '@libsql/client/web';
import type { DateRecordDto } from '~~/shared/types/api';

export const listDateRecords = async (db: Client): Promise<DateRecordDto[]> => {
  const result = await db.execute(
    'SELECT id, title, start_date, end_mode, end_date, include_start_day FROM date_ranges ORDER BY id',
  );
  return result.rows.map(row => ({
    id: Number(row['id']),
    title: String(row['title']),
    startDate: String(row['start_date']),
    endMode: row['end_mode'] === 'today' ? 'today' : 'fixed',
    endDate: row['end_date'] === null ? null : String(row['end_date']),
    includeStartDay: Number(row['include_start_day']) === 1,
  }));
};
