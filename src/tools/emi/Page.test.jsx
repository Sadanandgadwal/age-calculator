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
const fill = () => {
  set('Loan amount (₹)', '1000000');
  set('Interest rate (% a year)', '8.5');
  set('Loan tenure (years)', '20');
};

describe('EMI Calculator', () => {
  it('shows results and moves focus to them', async () => {
    const user = setup();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    fill();
    await calculate(user);

    expect(screen.getByText('₹8,678.23')).toBeInTheDocument();
    expect(screen.getByText('Tenure').parentElement).toHaveTextContent('240 months');
    expect(screen.getByRole('table', { name: 'Yearly schedule' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(21);
    expect(screen.getByRole('heading', { name: 'Your EMI' })).toHaveFocus();
  });

  it('switches the tenure unit', async () => {
    const user = setup();
    fill();
    await user.click(screen.getByRole('button', { name: 'Months' }));
    set('Loan tenure (months)', '240');
    await calculate(user);
    expect(screen.getByText('₹8,678.23')).toBeInTheDocument();
  });

  it('shows errors and focuses the first invalid field', async () => {
    const user = setup();
    await calculate(user);

    expect(screen.getByText('Please enter the loan amount.')).toBeInTheDocument();
    expect(screen.getByText('Please enter the interest rate.')).toBeInTheDocument();
    expect(screen.getByText('Please enter the loan tenure.')).toBeInTheDocument();
    expect(screen.getByLabelText('Loan amount (₹)')).toHaveFocus();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('updates after calculating, and resets', async () => {
    const user = setup();
    fill();
    await calculate(user);
    set('Interest rate (% a year)', '0');
    expect(screen.getByText('Total Interest').parentElement).toHaveTextContent('₹0.00');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Loan amount (₹)')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('copies results', async () => {
    const user = setup();
    fill();
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Monthly EMI: ₹8,678.23');
  });

  it('shows the disclaimer and required sections', () => {
    setup();
    expect(screen.getByText(/provides estimates and is not financial advice/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'EMI Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
