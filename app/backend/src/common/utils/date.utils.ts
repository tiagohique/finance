export interface YearMonth {
  year: number;
  month: number;
}

export const toYearMonthKey = ({ year, month }: YearMonth): string =>
  `${year}-${month.toString().padStart(2, '0')}`;

export const parseIsoDate = (value: string): Date => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date: ${value}`);
  }
  return date;
};

export const isWithinRange = (
  dateIso: string,
  from?: string,
  to?: string,
): boolean => {
  const date = parseIsoDate(dateIso);
  if (from) {
    const fromDate = parseIsoDate(from);
    if (date < fromDate) {
      return false;
    }
  }
  if (to) {
    const toDate = parseIsoDate(to);
    if (date > toDate) {
      return false;
    }
  }
  return true;
};

export const occursInMonth = (
  dateIso: string,
  { year, month }: YearMonth,
  isRecurring: boolean,
): boolean => {
  const date = parseIsoDate(dateIso);
  const dateMonth = date.getMonth() + 1;
  const dateYear = date.getFullYear();

  if (!isRecurring) {
    return dateYear === year && dateMonth === month;
  }

  if (dateYear > year) {
    return false;
  }
  if (dateYear === year && dateMonth > month) {
    return false;
  }
  return true;
};

export const startOfMonthIso = ({ year, month }: YearMonth): string =>
  `${year}-${month.toString().padStart(2, '0')}-01`;

export const endOfMonthIso = ({ year, month }: YearMonth): string => {
  const date = new Date(`${startOfMonthIso({ year, month })}T00:00:00`);
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month.toString().padStart(2, '0')}-${day}`;
};

export const daysInMonth = ({ year, month }: YearMonth): number => {
  const date = new Date(`${startOfMonthIso({ year, month })}T00:00:00`);
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return date.getDate();
};
