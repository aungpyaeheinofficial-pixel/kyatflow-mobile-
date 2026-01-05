// Target Management for Monthly Goals
import { settingsStorage } from './storage';

const TARGET_KEY = 'monthly_income_target';

export const targetStorage = {
  getMonthlyIncomeTarget: (): number => {
    return settingsStorage.get<number>(TARGET_KEY, 0);
  },

  setMonthlyIncomeTarget: (target: number): void => {
    settingsStorage.set(TARGET_KEY, target);
  },

  clearTarget: (): void => {
    settingsStorage.set(TARGET_KEY, 0);
  },
};

