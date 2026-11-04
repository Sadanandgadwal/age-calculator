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

describe('Discount Calculator', () => {
  it('finds the price after a percentage discount', async () => {
    const user = setup();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    set('Original price (₹)', '1000');
    set('Discount', '20');
    await calculate(user);

    expect(card('Final Price')).toHaveTextContent('₹800.00');
    expect(card('You Save')).toHaveTextContent('₹200.00');
    expect(card('Discount')).toHaveTextContent('20%');
    expect(screen.getByRole('heading', { name: 'Your Savings' })).toHaveFocus();
  });

  it.each([
    ['Amount off', 'Original price (₹)', '1000', 'Discount amount (₹)', '250', 'Final Price', '₹750.00'],
    ['Find the discount', 'Original price (₹)', '1000', 'Sale price (₹)', '750', 'Discount', '25%'],
    ['Find the original price', 'Sale price (₹)', '800', 'Discount', '20', 'Final Price', '₹800.00'],
  ])('%s', async (mode, labelA, a, labelB, b, label, value) => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: mode }));
    set(labelA, a);
    set(labelB, b);
    await calculate(user);
    expect(card(label)).toHaveTextContent(value);
  });

  it('shows the original price when finding it', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Find the original price' }));
    set('Sale price (₹)', '800');
    set('Discount', '20');
    await calculate(user);
    expect(screen.getByText('Original Price').parentElement).toHaveTextContent('₹1,000.00');
  });

  it('shows errors and focuses the first invalid field', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the original price.')).toBeInTheDocument();
    expect(screen.getByLabelText('Original price (₹)')).toHaveFocus();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('clears values when the mode changes', async () => {
    const user = setup();
    set('Original price (₹)', '1000');
    set('Discount', '20');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Amount off' }));

    expect(screen.getByLabelText('Original price (₹)')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('updates after calculating, resets and copies', async () => {
    const user = setup();
    set('Original price (₹)', '1000');
    set('Discount', '20');
    await calculate(user);
    set('Discount', '10');
    expect(card('Final Price')).toHaveTextContent('₹900.00');

    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Final price: ₹900.00');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Discount')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Discount Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
