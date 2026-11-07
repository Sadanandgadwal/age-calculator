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

describe('Ratio Calculator', () => {
  it('simplifies a ratio', async () => {
    const user = setup();
    set('First number (A)', '12');
    set('Second number (B)', '16');
    await calculate(user);
    expect(card('Simplest form')).toHaveTextContent('3 : 4');
    expect(screen.getByRole('heading', { name: 'Your Ratio' })).toHaveFocus();
  });

  it('finds a missing value', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Find the missing value' }));
    set('A', '2');
    set('B', '3');
    set('C', '10');
    await calculate(user);
    expect(card('Missing value')).toHaveTextContent('15');
  });

  it('shares a total', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Share a total' }));
    set('Total to share', '1000');
    set('Ratio part A', '2');
    set('Ratio part B', '3');
    await calculate(user);
    expect(card('Part A')).toHaveTextContent('400');
    expect(card('Part B')).toHaveTextContent('600');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the first number.')).toBeInTheDocument();
    expect(screen.getByLabelText('First number (A)')).toHaveFocus();
    set('First number (A)', '12');
    set('Second number (B)', '16');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Simplest form: 3 : 4');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('First number (A)')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Ratio Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
