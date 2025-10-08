import { fireEvent, render, screen } from '@testing-library/react'
import { MonthPicker } from '../MonthPicker'
import { useFiltersStore } from '../../../store/useFiltersStore'

describe('MonthPicker', () => {
  beforeEach(() => {
    useFiltersStore.setState({ year: 2025, month: 6 })
  })

  it('navigates between months', () => {
    render(<MonthPicker />)

    const prevButton = screen.getByLabelText('Mes anterior')
    fireEvent.click(prevButton)
    const stateAfterPrev = useFiltersStore.getState()
    expect(stateAfterPrev.month).toBe(5)
    expect(stateAfterPrev.year).toBe(2025)

    const nextButton = screen.getByLabelText('Proximo mes')
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)
    const stateAfterNext = useFiltersStore.getState()
    expect(stateAfterNext.month).toBe(7)
    expect(stateAfterNext.year).toBe(2025)
  })
})
