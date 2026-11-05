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
const detail = (label) => screen.getByText(label, { selector: 'dt' }).parentElement;
const fill = () => {
  set('Date', '2026-01-15');
  set('Time', '12:00');
};

describe('Time Zone Converter', () => {
  it('starts on India to New York with no result', () => {
    setup();
    expect(screen.getByLabelText('From time zone')).toHaveValue('Asia/Kolkata');
    expect(screen.getByLabelText('To time zone')).toHaveValue('America/New_York');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('shows the converted time, date, day and offsets', async () => {
    const user = setup();
    fill();
    await calculate(user);

    expect(screen.getByText('1:30 AM')).toBeInTheDocument();
    expect(screen.getByText('Eastern Standard Time')).toBeInTheDocument();
    expect(detail('To')).toHaveTextContent('1:30 AM, Thursday, 15 Jan 2026');
    expect(detail('From Time Zone')).toHaveTextContent('UTC+05:30');
    expect(detail('To Time Zone')).toHaveTextContent('UTC−05:00');
    expect(detail('Time Difference')).toHaveTextContent('10 hours 30 minutes behind');
    expect(screen.getByRole('heading', { name: 'Converted Time' })).toHaveFocus();
  });

  it('swaps time zones', async () => {
    const user = setup();
    fill();
    await user.click(screen.getByRole('button', { name: 'Swap time zones' }));
    expect(screen.getByLabelText('From time zone')).toHaveValue('America/New_York');
    expect(screen.getByLabelText('To time zone')).toHaveValue('Asia/Kolkata');

    await calculate(user);
    expect(screen.getByText('10:30 PM')).toBeInTheDocument();
  });

  it('updates when a zone changes after calculating', async () => {
    const user = setup();
    fill();
    await calculate(user);
    await user.selectOptions(screen.getByLabelText('To time zone'), 'Asia/Dubai');
    expect(screen.getByText('10:30 AM')).toBeInTheDocument();
  });

  it('explains a skipped time', async () => {
    const user = setup();
    set('Date', '2026-03-08');
    set('Time', '02:30');
    await user.selectOptions(screen.getByLabelText('From time zone'), 'America/New_York');
    await calculate(user);
    expect(screen.getByText(/skipped when the clocks go forward/)).toBeInTheDocument();
  });

  it('shows errors and focuses the first invalid field', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please choose a time.')).toBeInTheDocument();
    expect(screen.getByLabelText('Time')).toHaveFocus();
  });

  it('copies and resets', async () => {
    const user = setup();
    fill();
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('To: 1:30 AM, Thursday, 15 Jan 2026');

    await user.selectOptions(screen.getByLabelText('To time zone'), 'Asia/Dubai');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Time')).toHaveValue('');
    expect(screen.getByLabelText('To time zone')).toHaveValue('America/New_York');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Time Zone Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
