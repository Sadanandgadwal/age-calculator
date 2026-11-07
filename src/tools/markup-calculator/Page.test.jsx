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

describe('Markup Calculator', () => {
  it('prices from a markup', async () => {
    const user = setup();
    set('Cost (₹)', '400');
    set('Markup', '50');
    await calculate(user);
    expect(card('Selling price')).toHaveTextContent('₹600.00');
    expect(card('Margin')).toHaveTextContent('33.33%');
    expect(screen.getByRole('heading', { name: 'Your Price' })).toHaveFocus();
  });

  it('finds the markup from two prices', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Find the markup' }));
    set('Cost (₹)', '250');
    set('Selling price (₹)', '400');
    await calculate(user);
    expect(card('Markup')).toHaveTextContent('60%');
    expect(card('Margin')).toHaveTextContent('37.5%');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the cost.')).toBeInTheDocument();
    expect(screen.getByLabelText('Cost (₹)')).toHaveFocus();
    set('Cost (₹)', '100');
    set('Markup', '25');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Margin: 20%');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Cost (₹)')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Markup Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
