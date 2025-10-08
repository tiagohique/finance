import { forwardRef } from 'react'
import { FormInput } from './FormInput'

interface MoneyInputProps {
  label: string
  name: string
  value: string | number
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  placeholder?: string
  min?: number
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ label, name, value, onChange, error, placeholder, min = 0 }, ref) => (
    <FormInput
      ref={ref}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      type="number"
      step="0.01"
      min={min}
      inputMode="decimal"
      placeholder={placeholder}
      error={error}
    />
  ),
)

MoneyInput.displayName = 'MoneyInput'
