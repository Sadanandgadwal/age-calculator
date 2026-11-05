import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const generate = (user) => user.click(screen.getByRole('button', { name: /Generate/ }));

describe('Password Generator page', () => {
  it('creates a new password each time, with Copy only', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.queryByRole('region', { name: 'Output' })).toBeNull();
    await generate(user);
    const first = screen.getByRole('region', { name: 'Output' }).textContent;
    expect(first).toHaveLength(16);
    await generate(user);
    expect(screen.getByRole('region', { name: 'Output' }).textContent).not.toBe(first);
    expect(screen.getByRole('button', { name: /Copy results/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Share/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Print/ })).toBeNull();
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Length'), { target: { value: '2' } });
    await generate(user);
    expect(screen.getByText('Please enter a length from 4 to 128.')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Output' })).toBeNull();
  });
});
