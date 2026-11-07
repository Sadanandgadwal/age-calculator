import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScheduleTable from './ScheduleTable.jsx';

describe('ScheduleTable', () => {
  it('shows a captioned, scrollable table with row headers', () => {
    render(<ScheduleTable caption="Yearly schedule" columns={['Year', 'Interest', 'Balance']} rows={[[1, '₹10', '₹90'], [2, '₹5', '₹0']]} />);
    expect(screen.getByRole('region', { name: 'Yearly schedule, scrollable' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('table', { name: 'Yearly schedule' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['Year', 'Interest', 'Balance']);
    expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['1', '2']);
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['₹10', '₹90', '₹5', '₹0']);
  });
});
