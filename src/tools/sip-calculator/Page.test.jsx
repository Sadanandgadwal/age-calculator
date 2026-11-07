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

describe('SIP Calculator', () => {
  it('works out the SIP value', async () => {
    const user = setup();
    set('Monthly investment (₹)', '5000');
    set('Time (years)', '10');
    await calculate(user);
    expect(card('Expected value')).toHaveTextContent('₹11,61,695.38');
    expect(card('Total invested')).toHaveTextContent('₹6,00,000.00');
    expect(screen.getByRole('table', { name: 'Yearly growth' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your SIP Growth' })).toHaveFocus();
  });

  it('adds a yearly step-up', async () => {
    const user = setup();
    set('Monthly investment (₹)', '5000');
    set('Time (years)', '10');
    set('Yearly increase in SIP (optional)', '10');
    await calculate(user);
    expect(card('Total invested')).toHaveTextContent('₹9,56,245.80');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the monthly investment.')).toBeInTheDocument();
    expect(screen.getByLabelText('Monthly investment (₹)')).toHaveFocus();
    set('Monthly investment (₹)', '1000');
    set('Expected return (% a year)', '0');
    set('Time (years)', '1');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Expected value: ₹12,000.00');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Expected return (% a year)')).toHaveValue('12');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'SIP Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
