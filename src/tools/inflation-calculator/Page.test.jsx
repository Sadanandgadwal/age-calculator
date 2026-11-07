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

describe('Inflation Calculator', () => {
  it('works out a future cost', async () => {
    const user = setup();
    set('Cost today (₹)', '100000');
    set('Years from now', '10');
    await calculate(user);
    expect(card('Cost in 10 years')).toHaveTextContent('₹1,79,084.77');
    expect(card('Price rise')).toHaveTextContent('79.08%');
    expect(screen.getByRole('heading', { name: 'Inflation Effect' })).toHaveFocus();
  });

  it('works out the value of past money', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Value of past money' }));
    set('Amount in the past (₹)', '1000');
    set('Inflation (% a year)', '7');
    set('Years ago', '20');
    await calculate(user);
    expect(card('Worth today')).toHaveTextContent('₹3,869.68');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the amount.')).toBeInTheDocument();
    expect(screen.getByLabelText('Cost today (₹)')).toHaveFocus();
    set('Cost today (₹)', '100');
    set('Inflation (% a year)', '0');
    set('Years from now', '5');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Cost in 5 years: ₹100.00');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Inflation (% a year)')).toHaveValue('6');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Inflation Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
