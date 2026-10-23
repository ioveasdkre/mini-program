import type { Client } from '@libsql/client/web';
import type { SavingsScenarioDto, SavingsScenarioInput } from '~~/shared/types/api';

export const listSavingsScenarios = async (db: Client): Promise<SavingsScenarioDto[]> => {
  const result = await db.execute(
    'SELECT id, name, initial_amount, monthly_deposit, annual_rate, years, updated_by, updated_at FROM savings_scenarios ORDER BY updated_at DESC, id DESC',
  );
  return result.rows.map(row => ({
    id: Number(row['id']),
    name: String(row['name']),
    initialAmount: Number(row['initial_amount']),
    monthlyDeposit: Number(row['monthly_deposit']),
    annualRate: Number(row['annual_rate']),
    years: Number(row['years']),
    updatedBy: String(row['updated_by']),
    updatedAt: String(row['updated_at']),
  }));
};

export const parseSavingsScenarioInput = (body: unknown): SavingsScenarioInput => {
  const data = asRecord(body);
  return {
    name: asText(data['name'], '方案名稱', 50),
    initialAmount: asNumber(data['initialAmount'], '初始金額', 0, 1e12),
    monthlyDeposit: asNumber(data['monthlyDeposit'], '每月存款金額', 0, 1e12),
    annualRate: asNumber(data['annualRate'], '年利率', 0, 100),
    years: asNumber(data['years'], '存款年數', 1, 100, true),
  };
};
