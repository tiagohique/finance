export const getPeriodRange = (year: number, month: number) => {
  const start = `${year}-${month.toString().padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${month.toString().padStart(2, '0')}-${lastDay
    .toString()
    .padStart(2, '0')}`
  return { from: start, to: end }
}
