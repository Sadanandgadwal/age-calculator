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

describe('Profit and Loss Calculator', () => {
  it('finds a profit', async () => {
    const user = setup();
    set('Cost price (₹)', '800');
    set('Selling price (₹)', '1000');
    await calculate(user);
    expect(card('Profit')).toHaveTextContent('₹200.00');
    expect(card('Profit %')).toHaveTextContent('25%');
    expect(card('Margin')).toHaveTextContent('20%');
    expect(screen.getByRole('heading', { name: 'Your Profit or Loss' })).toHaveFocus();
  });

  it('finds a loss', async () => {
    const user = setup();
    set('Cost price (₹)', '1000');
    set('Selling price (₹)', '800');
    await calculate(user);
    expect(card('Loss')).toHaveTextContent('₹200.00');
    expect(card('Loss %')).toHaveTextContent('20%');
  });

  it('finds the selling price', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Find selling price' }));
    set('Cost price (₹)', '800');
    set('Profit % (use a minus sign for a loss)', '25');
    await calculate(user);
    expect(screen.getByText('Selling price', { selector: 'dt' }).parentElement).toHaveTextContent('₹1,000.00');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the cost price.')).toBeInTheDocument();
    expect(screen.getByLabelText('Cost price (₹)')).toHaveFocus();
    set('Cost price (₹)', '800');
    set('Selling price (₹)', '1000');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Profit: ₹200.00');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Cost price (₹)')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Profit and Loss Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
