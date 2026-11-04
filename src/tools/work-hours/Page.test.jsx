import { describe, expect, it } from 'vitest';
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

const set = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const calculate = (user) => user.click(screen.getByRole('button', { name: 'Calculate' }));
const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;
const detail = (label) => screen.getByText(label, { selector: 'dt' }).parentElement;
const fill = (clockIn, clockOut, breakMinutes = '') => {
  set('Clock-in time', clockIn);
  set('Clock-out time', clockOut);
  set('Break in minutes (optional)', breakMinutes);
};

describe('Work Hours Calculator', () => {
  it('defaults to an 8 hour day, with no result', () => {
    setup();
    expect(screen.getByLabelText('Daily working hours')).toHaveValue('8');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('shows net hours, overtime and the shift', async () => {
    const user = setup();
    fill('09:00', '20:00', '60');
    await calculate(user);

    expect(card('Net Working Hours')).toHaveTextContent('10 h 0 min');
    expect(card('Overtime')).toHaveTextContent('2 h 0 min');
    expect(card('Total Shift')).toHaveTextContent('11 h 0 min');
    expect(detail('Break')).toHaveTextContent('1 h 0 min');
    expect(detail('Decimal Hours')).toHaveTextContent('10');
    expect(screen.getByRole('heading', { name: 'Your Hours' })).toHaveFocus();
  });

  it('explains overnight shifts', async () => {
    const user = setup();
    fill('22:00', '06:00', '30');
    await calculate(user);

    expect(card('Net Working Hours')).toHaveTextContent('7 h 30 min');
    expect(detail('Below Daily Hours')).toHaveTextContent('0 h 30 min');
    expect(screen.getByText('Clock-out is earlier than clock-in, so it is treated as the next day.')).toBeInTheDocument();
  });

  it('updates overtime when the daily hours change', async () => {
    const user = setup();
    fill('09:00', '18:00');
    await calculate(user);
    expect(card('Overtime')).toHaveTextContent('1 h 0 min');

    set('Daily working hours', '6');
    expect(card('Overtime')).toHaveTextContent('3 h 0 min');
  });

  it('shows errors and focuses the first invalid field', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please choose a clock-in time.')).toBeInTheDocument();
    expect(screen.getByLabelText('Clock-in time')).toHaveFocus();

    fill('09:00', '10:00', '60');
    expect(screen.getByText('The break must be shorter than the shift.')).toBeInTheDocument();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('copies and resets', async () => {
    const user = setup();
    fill('09:00', '18:00', '60');
    set('Daily working hours', '7');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Net working hours: 8 h 0 min (8 hours)');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Clock-in time')).toHaveValue('');
    expect(screen.getByLabelText('Daily working hours')).toHaveValue('8');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Work Hours Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
