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

describe('Compound Interest Calculator', () => {
  it('grows a fixed deposit', async () => {
    const user = setup();
    set('Starting amount (₹)', '100000');
    set('Interest rate (% a year)', '8');
    set('Time (years)', '5');
    await calculate(user);
    expect(card('Final amount')).toHaveTextContent('₹1,48,594.74');
    expect(screen.getByRole('table', { name: 'Yearly growth' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your Growth' })).toHaveFocus();
  });

  it('uses monthly compounding and deposits', async () => {
    const user = setup();
    set('Starting amount (₹)', '0');
    set('Interest rate (% a year)', '12');
    set('Time (years)', '10');
    await user.selectOptions(screen.getByLabelText('Compounding'), '12');
    set('Monthly deposit (₹, optional)', '5000');
    await calculate(user);
    expect(card('Final amount')).toHaveTextContent('₹11,50,193.45');
    expect(card('Total invested')).toHaveTextContent('₹6,00,000.00');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the starting amount.')).toBeInTheDocument();
    expect(screen.getByLabelText('Starting amount (₹)')).toHaveFocus();
    set('Starting amount (₹)', '100000');
    set('Interest rate (% a year)', '10');
    set('Time (years)', '1');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Final amount: ₹1,10,381.29');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Compounding')).toHaveValue('4');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Compound Interest Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
