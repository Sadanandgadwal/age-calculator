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

describe('Savings Goal Calculator', () => {
  it('works out the monthly saving', async () => {
    const user = setup();
    set('Goal amount (₹)', '1000000');
    set('Expected return (% a year)', '8');
    set('Time (years)', '5');
    await calculate(user);
    expect(card('Save each month')).toHaveTextContent('₹13,609.73');
    expect(screen.getByRole('table', { name: 'Yearly progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your Savings Plan' })).toHaveFocus();
  });

  it('works out the time to reach a goal', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Time to reach a goal' }));
    set('Goal amount (₹)', '500000');
    set('Current savings (₹, optional)', '50000');
    set('Expected return (% a year)', '7');
    set('Monthly saving (₹)', '10000');
    await calculate(user);
    expect(card('Time to reach the goal')).toHaveTextContent('3 years 4 months');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the goal amount.')).toBeInTheDocument();
    expect(screen.getByLabelText('Goal amount (₹)')).toHaveFocus();
    set('Goal amount (₹)', '120000');
    set('Expected return (% a year)', '0');
    set('Time (years)', '1');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Save each month: ₹10,000.00');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Goal amount (₹)')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Savings Goal Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
