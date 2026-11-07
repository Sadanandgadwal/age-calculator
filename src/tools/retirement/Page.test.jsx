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

describe('Retirement Calculator', () => {
  it('works out the plan', async () => {
    const user = setup();
    set('Current age', '30');
    set('Monthly expenses today (₹)', '50000');
    set('Return before retirement (% a year)', '12');
    set('Retirement savings so far (₹, optional)', '500000');
    await calculate(user);
    expect(card('Money needed at retirement')).toHaveTextContent('₹7,48,85,443.07');
    expect(card('Save each month')).toHaveTextContent('₹16,283.61');
    expect(screen.getByRole('heading', { name: 'Your Retirement Plan' })).toHaveFocus();
  });

  it('shows errors, copies and resets to the defaults', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter your current age.')).toBeInTheDocument();
    expect(screen.getByLabelText('Current age')).toHaveFocus();
    set('Current age', '40');
    set('Monthly expenses today (₹)', '30000');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Years until retirement: 20');
    set('Inflation (% a year)', '3');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Inflation (% a year)')).toHaveValue('6');
    expect(screen.getByLabelText('Current age')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Retirement Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
