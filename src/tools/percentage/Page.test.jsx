import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';
import { MODES } from './logic.js';

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  );
  return user;
}

const fill = (a, b) => {
  fireEvent.change(document.getElementById('percent-a'), { target: { value: a } });
  fireEvent.change(document.getElementById('percent-b'), { target: { value: b } });
};
const calculate = (user) => user.click(screen.getByRole('button', { name: 'Calculate' }));

describe('Percentage Calculator', () => {
  it('offers every mode, with the first selected', () => {
    setup();
    const buttons = MODES.map(({ name }) => screen.getByRole('button', { name }));
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows the answer, formula and steps, and moves focus to them', async () => {
    const user = setup();
    fill('20', '500');
    await calculate(user);

    expect(screen.getByText('20% of 500 is 100')).toBeInTheDocument();
    expect(screen.getByText('Result = (X ÷ 100) × Y')).toBeInTheDocument();
    expect(screen.getByText('(20 ÷ 100) × 500')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Result' })).toHaveFocus();
  });

  it.each([
    ['X is what %', '50', '200', '25%'],
    ['Find the whole', '50', '25', '200'],
    ['Increase', '500', '20', '600'],
    ['Decrease', '500', '20', '400'],
    ['Difference', '100', '150', '40%'],
    ['Add %', '500', '20', '600'],
    ['Subtract %', '500', '20', '400'],
    ['Change', '100', '150', '50%'],
  ])('calculates in %s mode', async (name, a, b, answer) => {
    const user = setup();
    await user.click(screen.getByRole('button', { name }));
    fill(a, b);
    await calculate(user);
    expect(screen.getByText(answer)).toBeInTheDocument();
  });

  it('updates labels and clears everything when the mode changes', async () => {
    const user = setup();
    fill('20', '500');
    await calculate(user);

    await user.click(screen.getByRole('button', { name: 'Change' }));

    expect(screen.getByRole('heading', { name: 'Percentage change between two values' })).toBeInTheDocument();
    expect(screen.getByLabelText('Starting value')).toHaveValue('');
    expect(screen.getByLabelText('Final value')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('shows an error for division by zero and focuses the field', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'X is what %' }));
    fill('5', '0');
    await calculate(user);

    expect(screen.getByText("This value can't be zero, as it would mean dividing by zero.")).toBeInTheDocument();
    expect(screen.getByLabelText('Total (Y)')).toHaveFocus();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('shows errors for missing and invalid values', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getAllByText('Please enter a value.')).toHaveLength(2);

    fill('abc', '5');
    expect(screen.getByText('Please enter a valid number.')).toBeInTheDocument();
  });

  it('updates the answer as values change after calculating', async () => {
    const user = setup();
    fill('20', '500');
    await calculate(user);
    fill('10', '500');
    expect(screen.getByText('10% of 500 is 50')).toBeInTheDocument();
  });

  it('resets values and results but keeps the mode', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Increase' }));
    fill('500', '20');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByLabelText('Number')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('copies the result', async () => {
    const user = setup();
    fill('20', '500');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));

    expect(await navigator.clipboard.readText()).toContain('20% of 500 is 100');
    expect(screen.getByText('Results copied to clipboard.')).toBeInTheDocument();
  });

  it('has the required page sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Percentage Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
