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

describe('Sales Tax Calculator', () => {
  it('adds tax', async () => {
    const user = setup();
    set('Price before tax (₹)', '250');
    set('Tax rate', '8');
    await calculate(user);
    expect(card('Tax')).toHaveTextContent('₹20.00');
    expect(card('Price including tax')).toHaveTextContent('₹270.00');
    expect(screen.getByRole('heading', { name: 'Your Tax' })).toHaveFocus();
  });

  it('removes tax', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Remove tax' }));
    set('Price including tax (₹)', '1120');
    set('Tax rate', '12');
    await calculate(user);
    expect(card('Price before tax')).toHaveTextContent('₹1,000.00');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the price.')).toBeInTheDocument();
    expect(screen.getByLabelText('Price before tax (₹)')).toHaveFocus();
    set('Price before tax (₹)', '100');
    set('Tax rate', '5');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Tax: ₹5.00');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Tax rate')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Sales Tax Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
