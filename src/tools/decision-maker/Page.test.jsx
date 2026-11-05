import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const decide = (user) => user.click(screen.getByRole('button', { name: /Decide$/ }));

describe('Decision Maker page', () => {
  it('gives one answer with the chances', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Options, one on each line'), { target: { value: 'Tea | 1000\nCoffee | 1' } });
    await decide(user);
    expect(screen.getByText('Decision', { selector: 'span' }).parentElement.textContent).toMatch(/Tea|Coffee/);
    expect(screen.getByText('Tea', { selector: 'dt' })).toBeInTheDocument();
  });

  it('explains what it needs', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    await decide(user);
    expect(screen.getByText(/at least two options/)).toBeInTheDocument();
  });
});
