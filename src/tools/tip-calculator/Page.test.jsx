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

describe('Tip Calculator', () => {
  it('works out the tip and total', async () => {
    const user = setup();
    set('Bill amount (₹)', '1000');
    await calculate(user);
    expect(card('Tip')).toHaveTextContent('₹100.00');
    expect(card('Total')).toHaveTextContent('₹1,100.00');
    expect(screen.getByRole('heading', { name: 'Your Tip' })).toHaveFocus();
  });

  it('uses a preset and splits the bill', async () => {
    const user = setup();
    set('Bill amount (₹)', '2400');
    await user.click(screen.getByRole('button', { name: '15%' }));
    expect(screen.getByLabelText('Tip')).toHaveValue('15');
    set('Number of people', '4');
    await calculate(user);
    expect(card('Each person pays')).toHaveTextContent('₹690.00');
  });

  it('rounds each share up', async () => {
    const user = setup();
    set('Bill amount (₹)', '1234.5');
    set('Tip', '15');
    set('Number of people', '4');
    await user.click(screen.getByLabelText('Round each share up to the nearest rupee'));
    await calculate(user);
    expect(card('Each person pays')).toHaveTextContent('₹355.00');
    expect(screen.getByText('Rounding up adds ₹0.32 to the tip, making it 15.03% of the bill.')).toBeInTheDocument();
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the bill amount.')).toBeInTheDocument();
    expect(screen.getByLabelText('Bill amount (₹)')).toHaveFocus();
    set('Bill amount (₹)', '500');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Tip: ₹50.00');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Bill amount (₹)')).toHaveValue('');
    expect(screen.getByLabelText('Tip')).toHaveValue('10');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Tip Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
