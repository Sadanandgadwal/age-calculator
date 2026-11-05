import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('SQL Formatter page', () => {
  it('formats live and explains errors', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your SQL'), { target: { value: 'select 1' } });
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('SELECT\n  1');
    fireEvent.click(screen.getByRole('button', { name: 'MySQL' }));
    fireEvent.change(screen.getByLabelText('Your SQL'), { target: { value: "select 'x" } });
    expect(screen.getByText(/Parse error/)).toBeInTheDocument();
  });
});
