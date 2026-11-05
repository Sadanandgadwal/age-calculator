import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const flip = (user) => user.click(screen.getByRole('button', { name: /Flip$/ }));

describe('Coin Flip page', () => {
  it('flips only when asked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    await flip(user);
    expect(screen.getByText('Result', { selector: 'span' }).parentElement.textContent).toMatch(/Heads|Tails/);
  });

  it('shows totals for many flips, and validates', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Number of flips'), { target: { value: '10' } });
    await flip(user);
    expect(screen.getByText('Flips', { selector: 'span' }).parentElement).toHaveTextContent('10');
    fireEvent.change(screen.getByLabelText('Number of flips'), { target: { value: '0' } });
    await flip(user);
    expect(screen.getByText('Please enter 1 to 1,000.')).toBeInTheDocument();
  });
});
