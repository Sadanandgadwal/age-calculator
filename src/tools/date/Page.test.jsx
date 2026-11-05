import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';
import { MODES } from './logic.js';

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  );
  return user;
}

const set = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const calculate = (user) => user.click(screen.getByRole('button', { name: 'Calculate' }));
const detail = (label) => screen.getByText(label, { selector: 'dt, span' }).parentElement;

describe('Date Calculator', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 3, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('offers every mode and starts from today', () => {
    setup();
    MODES.forEach(({ name }) => expect(screen.getByRole('button', { name })).toBeInTheDocument());
    expect(screen.getByLabelText('Start Date')).toHaveValue('2026-11-03');
    expect(screen.getByLabelText('End Date')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('shows every result for a date range', async () => {
    const user = setup();
    set('Start Date', '2026-01-01');
    set('End Date', '2026-03-01');
    await calculate(user);

    expect(detail('Total Days')).toHaveTextContent('59');
    expect(detail('Weekdays')).toHaveTextContent('42');
    expect(detail('Weekend Days')).toHaveTextContent('17');
    expect(detail('Start Date')).toHaveTextContent('Thursday, 1 Jan 2026');
    expect(detail('End Date Counted')).toHaveTextContent('No');
    expect(detail('Total Weeks')).toHaveTextContent('8 weeks, 3 days');
    expect(detail('Total Months')).toHaveTextContent('2 months');
    expect(detail('Years, Months and Days')).toHaveTextContent('0 years, 2 months, 0 days');
    expect(screen.getByRole('heading', { name: 'Your Results' })).toHaveFocus();
  });

  it('switches between inclusive and exclusive counting', async () => {
    const user = setup();
    set('Start Date', '2026-01-01');
    set('End Date', '2026-01-02');
    await calculate(user);
    expect(detail('Total Days')).toHaveTextContent('1');

    await user.click(screen.getByLabelText('Include the end date in the count'));
    expect(detail('Total Days')).toHaveTextContent('2');
    expect(detail('End Date Counted')).toHaveTextContent('Yes');
  });

  it('counts business days, including the end date by default', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Business days' }));
    expect(screen.getByLabelText('Include the end date in the count')).toBeChecked();

    set('Start Date', '2026-11-02');
    set('End Date', '2026-11-08');
    await calculate(user);

    expect(detail('Business Days')).toHaveTextContent('5');
    expect(detail('Weekend Days')).toHaveTextContent('2');
    expect(screen.getByText(/Public holidays are not removed/)).toBeInTheDocument();
  });

  it('counts weekdays and weekends', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Weekdays & weekends' }));
    set('Start Date', '2026-11-07');
    set('End Date', '2026-11-08');
    await calculate(user);

    expect(detail('Weekdays')).toHaveTextContent('0');
    expect(detail('Weekend Days')).toHaveTextContent('2');
  });

  it.each([
    ['Add days', 'Days to add', '2026-12-31', '1', '1 Jan 2027'],
    ['Subtract days', 'Days to subtract', '2024-03-01', '1', '29 Feb 2024'],
    ['Add months', 'Months to add', '2026-01-15', '2', '15 Mar 2026'],
    ['Subtract months', 'Months to subtract', '2026-01-15', '1', '15 Dec 2025'],
    ['Add years', 'Years to add', '2026-11-03', '10', '3 Nov 2036'],
    ['Subtract years', 'Years to subtract', '2026-11-03', '26', '3 Nov 2000'],
    ['Date after N days', 'Number of days', '2026-11-03', '30', '3 Dec 2026'],
  ])('%s', async (name, label, start, amount, expected) => {
    const user = setup();
    await user.click(screen.getByRole('button', { name }));
    set('Start Date', start);
    set(label, amount);
    await calculate(user);
    expect(detail('Result Date')).toHaveTextContent(expected);
  });

  it('explains when a month end was adjusted', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Add months' }));
    set('Start Date', '2026-01-31');
    set('Months to add', '1');
    await calculate(user);

    expect(detail('Result Date')).toHaveTextContent('28 Feb 2026');
    expect(detail('Day of the Week')).toHaveTextContent('Saturday');
    expect(screen.getByText(/has no day 31/)).toBeInTheDocument();
  });

  it('rejects a reversed range and focuses the field', async () => {
    const user = setup();
    set('Start Date', '2026-01-02');
    set('End Date', '2026-01-01');
    await calculate(user);

    expect(screen.getByText("The end date can't be earlier than the start date.")).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toHaveFocus();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('rejects an invalid amount', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Add days' }));
    set('Days to add', '1.5');
    await calculate(user);
    expect(screen.getByText('Please enter a whole number of 0 or more.')).toBeInTheDocument();
  });

  it('clears results and the amount when the mode changes, but keeps the start date', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Add days' }));
    set('Start Date', '2026-01-01');
    set('Days to add', '1');
    await calculate(user);

    await user.click(screen.getByRole('button', { name: 'Add months' }));

    expect(screen.getByLabelText('Months to add')).toHaveValue('');
    expect(screen.getByLabelText('Start Date')).toHaveValue('2026-01-01');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('resets to today and clears results', async () => {
    const user = setup();
    set('Start Date', '2026-01-01');
    set('End Date', '2026-03-01');
    await user.click(screen.getByLabelText('Include the end date in the count'));
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByLabelText('Start Date')).toHaveValue('2026-11-03');
    expect(screen.getByLabelText('End Date')).toHaveValue('');
    expect(screen.getByLabelText('Include the end date in the count')).not.toBeChecked();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('copies results', async () => {
    const user = setup();
    set('Start Date', '2026-01-01');
    set('End Date', '2026-03-01');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));

    expect(await navigator.clipboard.readText()).toContain('Total days: 59 days');
    expect(screen.getByText('Results copied to clipboard.')).toBeInTheDocument();
  });

  it('has the required page sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Date Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
