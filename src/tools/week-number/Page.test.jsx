import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  );
  return user;
}

const setDate = (value) => fireEvent.change(screen.getByLabelText('Date'), { target: { value } });
const calculate = (user) => user.click(screen.getByRole('button', { name: 'Calculate' }));
const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;
const detail = (label) => screen.getByText(label, { selector: 'dt' }).parentElement;

describe('Week Number Calculator', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 3, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts on today, with no result', () => {
    setup();
    expect(screen.getByLabelText('Date')).toHaveValue('2026-11-03');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('shows the week, year, weekday and bounds', async () => {
    const user = setup();
    await calculate(user);

    expect(card('ISO Week Number')).toHaveTextContent('45');
    expect(card('Week Year')).toHaveTextContent('2026');
    expect(card('Weekday')).toHaveTextContent('Tuesday');
    expect(detail('Week Start (Monday)')).toHaveTextContent('2 Nov 2026');
    expect(detail('Week End (Sunday)')).toHaveTextContent('8 Nov 2026');
    expect(detail('Week Code')).toHaveTextContent('2026-W45');
    expect(screen.getByRole('heading', { name: 'Your Week' })).toHaveFocus();
  });

  it('explains a date whose week belongs to another year', async () => {
    const user = setup();
    setDate('2021-01-01');
    await calculate(user);

    expect(card('ISO Week Number')).toHaveTextContent('53');
    expect(card('Week Year')).toHaveTextContent('2020');
    expect(screen.getByText('This date is in 2021, but its ISO week belongs to 2020.')).toBeInTheDocument();

    setDate('2026-06-01');
    expect(screen.queryByText(/but its ISO week belongs/)).not.toBeInTheDocument();
  });

  it('shows an error for a missing date', async () => {
    const user = setup();
    setDate('');
    await calculate(user);
    expect(screen.getByText('Please choose a date.')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toHaveFocus();
  });

  it('copies and resets', async () => {
    const user = setup();
    setDate('2021-01-01');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Week code: 2020-W53');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Date')).toHaveValue('2026-11-03');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Week Number Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
