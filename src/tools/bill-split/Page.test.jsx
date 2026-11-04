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

describe('Bill Split Calculator', () => {
  it('splits a bill with tax and tip', async () => {
    const user = setup();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    set('Bill amount (₹)', '1000');
    set('Number of people', '5');
    set('Tax (optional)', '5');
    set('Tip (optional)', '10');
    await calculate(user);

    expect(card('Each Person Pays')).toHaveTextContent('₹230.00');
    expect(card('Total Bill')).toHaveTextContent('₹1,150.00');
    expect(screen.getByText('Tax (5%)').parentElement).toHaveTextContent('₹50.00');
    expect(screen.getByText('Tip (10%)').parentElement).toHaveTextContent('₹100.00');
    expect(screen.getByRole('heading', { name: 'Your Split' })).toHaveFocus();
  });

  it('explains uneven shares', async () => {
    const user = setup();
    set('Bill amount (₹)', '100');
    set('Number of people', '3');
    await calculate(user);
    expect(screen.getByText("The bill doesn't divide evenly: 1 person pays ₹33.34 and 2 people pay ₹33.33.")).toBeInTheDocument();
  });

  it('rounds up on request', async () => {
    const user = setup();
    set('Bill amount (₹)', '100');
    set('Number of people', '3');
    await calculate(user);
    await user.click(screen.getByLabelText('Round each share up to a whole rupee'));

    expect(card('Each Person Pays')).toHaveTextContent('₹34.00');
    expect(screen.getByText(/leaves ₹2.00 over/)).toBeInTheDocument();
  });

  it('shows errors and focuses the first invalid field', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the bill amount.')).toBeInTheDocument();
    expect(screen.getByText('Please enter the number of people.')).toBeInTheDocument();
    expect(screen.getByLabelText('Bill amount (₹)')).toHaveFocus();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('copies and resets', async () => {
    const user = setup();
    set('Bill amount (₹)', '1200');
    set('Number of people', '4');
    await user.click(screen.getByLabelText('Round each share up to a whole rupee'));
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Each person pays: ₹300.00');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Bill amount (₹)')).toHaveValue('');
    expect(screen.getByLabelText('Round each share up to a whole rupee')).not.toBeChecked();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Bill Split Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
