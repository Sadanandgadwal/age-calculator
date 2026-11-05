import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Uptime Calculator page', () => {
  it('converts in both directions', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Uptime'), { target: { value: '99.9' } });
    expect(screen.getByText('43 min 49.8 s')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Downtime to uptime' }));
    fireEvent.change(screen.getByLabelText('Downtime (minutes)'), { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: 'Day' }));
    expect(screen.getByText('Uptime', { selector: 'span' }).parentElement).toHaveTextContent('95.833333%');
  });

  it('shows errors', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Uptime'), { target: { value: '101' } });
    expect(screen.getByText('Please enter a percentage from 0 to 100.')).toBeInTheDocument();
  });
});
