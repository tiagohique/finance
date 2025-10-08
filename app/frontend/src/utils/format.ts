const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const formatCurrency = (value: number) => currencyFormatter.format(value)

const dateFormatter = new Intl.DateTimeFormat('pt-BR')

const MONTH_ABBREVIATIONS = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
]

export const formatDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  return dateFormatter.format(date)
}

export const formatPercent = (value: number) => `${value.toFixed(0)}%`

export const monthLabel = (year: number, month: number) => {
  const label = MONTH_ABBREVIATIONS[month - 1] ?? ''
  return `${label} ${year}`
}

export const monthName = (month: number) => MONTH_ABBREVIATIONS[month - 1] ?? ''
