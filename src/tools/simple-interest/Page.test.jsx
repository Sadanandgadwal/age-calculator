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

describe('Simple Interest Calculator', () => {
  it('finds the interest', async () => {
    const user = setup();
    set('Principal (₹)', '50000');
    set('Interest rate (% a year)', '8');
    set('Time (years)', '3');
    await calculate(user);
    expect(card('Interest')).toHaveTextContent('₹12,000.00');
    expect(card('Total amount')).toHaveTextContent('₹62,000.00');
    expect(screen.getByRole('heading', { name: 'Your Interest' })).toHaveFocus();
  });

  it('finds the rate', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Find rate' }));
    set('Principal (₹)', '50000');
    set('Interest (₹)', '12000');
    set('Time (years)', '3');
    await calculate(user);
    expect(card('Interest rate')).toHaveTextContent('8% a year');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the principal.')).toBeInTheDocument();
    expect(screen.getByLabelText('Principal (₹)')).toHaveFocus();
    set('Principal (₹)', '1000');
    set('Interest rate (% a year)', '10');
    set('Time (years)', '2');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Interest: ₹200.00');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Principal (₹)')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Simple Interest Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
