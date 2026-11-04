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
const mode = (user, name) => user.click(screen.getByRole('button', { name }));
const fillAdd = () => {
  set('First time Hours', '1');
  set('First time Minutes', '45');
  set('Time to add Minutes', '30');
};

describe('Time Calculator', () => {
  it('adds times and moves focus to the result', async () => {
    const user = setup();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    fillAdd();
    await calculate(user);

    expect(screen.getByText('Result').parentElement).toHaveTextContent('2 hours, 15 minutes, 0 seconds');
    expect(screen.getByText('Total Minutes').parentElement).toHaveTextContent('135');
    expect(screen.getByRole('heading', { name: 'Your Result' })).toHaveFocus();
  });

  it('subtracts, with a negative result', async () => {
    const user = setup();
    await mode(user, 'Subtract times');
    set('First time Minutes', '30');
    set('Time to subtract Hours', '1');
    await calculate(user);
    expect(screen.getByText('Result').parentElement).toHaveTextContent('−0 hours, 30 minutes, 0 seconds');
  });

  it('finds the time between clock times, explaining overnight', async () => {
    const user = setup();
    await mode(user, 'Time between');
    set('Start time', '22:00');
    set('End time', '06:00');
    await calculate(user);

    expect(screen.getByText('Result').parentElement).toHaveTextContent('8 hours, 0 minutes, 0 seconds');
    expect(screen.getByText('The end time is earlier than the start time, so it is treated as the next day.')).toBeInTheDocument();
  });

  it('finds a time after and before', async () => {
    const user = setup();
    await mode(user, 'Time after');
    set('Start time', '23:30');
    set('Time to add Hours', '1');
    await calculate(user);
    expect(screen.getByText('12:30 AM')).toBeInTheDocument();
    expect(screen.getByText('1 day later')).toBeInTheDocument();

    await mode(user, 'Time before');
    set('Start time', '00:30');
    set('Time to subtract Hours', '1');
    await calculate(user);
    expect(screen.getByText('11:30 PM')).toBeInTheDocument();
    expect(screen.getByText('1 day earlier')).toBeInTheDocument();
  });

  it('shows only the fields each mode needs', async () => {
    const user = setup();
    expect(screen.queryByLabelText('Start time')).not.toBeInTheDocument();
    await mode(user, 'Time between');
    expect(screen.queryByLabelText('First time Hours')).not.toBeInTheDocument();
    expect(screen.getByLabelText('End time')).toBeInTheDocument();
  });

  it('shows errors and focuses the first invalid field', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getAllByText('Please enter a time.')).toHaveLength(2);
    expect(screen.getByLabelText('First time Hours')).toHaveFocus();

    await mode(user, 'Time between');
    await calculate(user);
    expect(screen.getByText('Please choose a start time.')).toBeInTheDocument();
    expect(screen.getByLabelText('Start time')).toHaveFocus();
  });

  it('clears results when the mode changes, and resets', async () => {
    const user = setup();
    fillAdd();
    await calculate(user);
    await mode(user, 'Subtract times');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    expect(screen.getByLabelText('First time Hours')).toHaveValue('1');

    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('First time Hours')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('copies results', async () => {
    const user = setup();
    fillAdd();
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Result: 2 hours, 15 minutes, 0 seconds');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Time Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
