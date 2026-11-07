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

describe('Salary Calculator', () => {
  it('converts a monthly salary', async () => {
    const user = setup();
    set('Pay (₹)', '50000');
    await calculate(user);
    expect(card('Yearly')).toHaveTextContent('₹6,00,000.00');
    expect(card('Hourly')).toHaveTextContent('₹288.46');
    expect(screen.getByRole('table', { name: 'Pay for each period' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your Pay' })).toHaveFocus();
  });

  it('converts an hourly rate with a raise', async () => {
    const user = setup();
    set('Pay (₹)', '500');
    await user.click(screen.getByRole('button', { name: 'Hourly' }));
    set('Pay rise or cut (optional)', '10');
    await calculate(user);
    expect(card('Monthly')).toHaveTextContent('₹86,666.67');
    expect(screen.getByRole('columnheader', { name: 'After 10% raise' })).toBeInTheDocument();
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter your pay.')).toBeInTheDocument();
    expect(screen.getByLabelText('Pay (₹)')).toHaveFocus();
    set('Pay (₹)', '1200000');
    await user.click(screen.getByRole('button', { name: 'Yearly' }));
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Monthly: ₹1,00,000.00');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Hours worked a week')).toHaveValue('40');
    expect(screen.getByRole('button', { name: 'Monthly' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Salary Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
