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

const fill = () => {
  set('Loan balance (₹)', '1000000');
  set('Interest rate (% a year)', '8.5');
  set('Remaining tenure (years)', '20');
  set('Extra payment each month (₹)', '5000');
};

describe('Loan Payoff Calculator', () => {
  it('shows the savings and a schedule', async () => {
    const user = setup();
    fill();
    await calculate(user);
    expect(card('Interest saved')).toHaveTextContent('₹6,69,067.37');
    expect(card('Time saved')).toHaveTextContent('11 years 4 months');
    expect(screen.getByRole('table', { name: 'Yearly schedule with extra payments' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your Savings' })).toHaveFocus();
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the loan balance.')).toBeInTheDocument();
    expect(screen.getByLabelText('Loan balance (₹)')).toHaveFocus();
    fill();
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('New payoff time: 8 years 8 months');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Loan balance (₹)')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Loan Payoff Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
