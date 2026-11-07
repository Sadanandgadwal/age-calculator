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

describe('Investment Return Calculator', () => {
  it('works out the yearly and total return', async () => {
    const user = setup();
    set('Amount invested (₹)', '100000');
    set('Current value (₹)', '200000');
    set('Time held (years)', '5');
    await calculate(user);
    expect(card('Yearly return (CAGR)')).toHaveTextContent('14.87%');
    expect(card('Total return')).toHaveTextContent('100%');
    expect(screen.getByRole('heading', { name: 'Your Return' })).toHaveFocus();
  });

  it('warns about short periods', async () => {
    const user = setup();
    set('Amount invested (₹)', '10000');
    set('Current value (₹)', '25000');
    set('Time held (years)', '0.5');
    await calculate(user);
    expect(screen.getByText(/assumes the same growth carries on/)).toBeInTheDocument();
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the amount invested.')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount invested (₹)')).toHaveFocus();
    set('Amount invested (₹)', '50000');
    set('Current value (₹)', '40000');
    set('Time held (years)', '2');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Loss: ₹10,000.00');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Amount invested (₹)')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Investment Return Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
