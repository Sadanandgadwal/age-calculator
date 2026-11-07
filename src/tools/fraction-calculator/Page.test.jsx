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

describe('Fraction Calculator', () => {
  it('adds two fractions', async () => {
    const user = setup();
    set('First fraction', '1/2');
    set('Second fraction', '1/3');
    await calculate(user);
    expect(card('Answer')).toHaveTextContent('5/6');
    expect(screen.getByText('Working').parentElement).toHaveTextContent('1/2 + 1/3 = 3/6 + 2/6 = 5/6');
    expect(screen.getByRole('heading', { name: 'Your Answer' })).toHaveFocus();
  });

  it('divides and shows a mixed number', async () => {
    const user = setup();
    set('First fraction', '3/4');
    await user.click(screen.getByRole('button', { name: '÷ Divide' }));
    set('Second fraction', '1/2');
    await calculate(user);
    expect(card('Answer')).toHaveTextContent('3/2');
    expect(card('Mixed number')).toHaveTextContent('1 1/2');
    expect(card('Decimal')).toHaveTextContent('1.5');
  });

  it('simplifies and converts decimals', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Simplify' }));
    set('Fraction', '12/16');
    await calculate(user);
    expect(card('Answer')).toHaveTextContent('3/4');
    await user.click(screen.getByRole('button', { name: 'Decimal to fraction' }));
    set('Decimal', '0.375');
    await calculate(user);
    expect(card('Answer')).toHaveTextContent('3/8');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter the first fraction.')).toBeInTheDocument();
    expect(screen.getByLabelText('First fraction')).toHaveFocus();
    set('First fraction', '1/2');
    set('Second fraction', '1/4');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Answer: 3/4');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('First fraction')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Fraction Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
