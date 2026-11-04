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
const detail = (label) => screen.getByText(label, { selector: 'dt' }).parentElement;

describe('Day of the Week Calculator', () => {
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

  it('shows the weekday and details', async () => {
    const user = setup();
    setDate('2024-02-29');
    await calculate(user);

    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByText('Weekday', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Day of the Year').parentElement).toHaveTextContent('60');
    expect(screen.getByText('ISO Week').parentElement).toHaveTextContent('9');
    expect(detail('Leap Year')).toHaveTextContent('Yes');
    expect(detail('Days in the Month')).toHaveTextContent('29');
    expect(detail('From Today')).toHaveTextContent('days ago');
    expect(screen.getByRole('heading', { name: 'Day of the Week' })).toHaveFocus();
  });

  it('handles a future weekend', async () => {
    const user = setup();
    setDate('2026-11-07');
    await calculate(user);
    expect(screen.getByText('Saturday')).toBeInTheDocument();
    expect(screen.getByText('Weekend', { selector: 'span' })).toBeInTheDocument();
    expect(detail('From Today')).toHaveTextContent('4 days from today');
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
    setDate('2024-02-29');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('29 Feb 2024 is a Thursday');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Date')).toHaveValue('2026-11-03');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Day of the Week Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
