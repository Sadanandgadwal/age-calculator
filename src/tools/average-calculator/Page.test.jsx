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

describe('Average Calculator', () => {
  it('works out the average and other statistics', async () => {
    const user = setup();
    set('Numbers', '3, 7, 7, 2, 9');
    await calculate(user);
    expect(card('Average (mean)')).toHaveTextContent('5.6');
    expect(card('Median')).toHaveTextContent('7');
    expect(card('Count')).toHaveTextContent('5');
    expect(screen.getByText('Mode', { selector: 'dt' }).parentElement).toHaveTextContent('7 (2 times)');
    expect(screen.getByRole('heading', { name: 'Your Average' })).toHaveFocus();
  });

  it('works out a weighted average', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Weighted average' }));
    set('Numbers', '80 60');
    set('Weights, in the same order', '3 1');
    await calculate(user);
    expect(card('Weighted average')).toHaveTextContent('75');
    expect(card('Simple average')).toHaveTextContent('70');
  });

  it('shows errors and focuses the field', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter some numbers.')).toBeInTheDocument();
    expect(screen.getByLabelText('Numbers')).toHaveFocus();
  });

  it('copies and resets', async () => {
    const user = setup();
    set('Numbers', '70 85 90 75');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Average (mean): 80');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Numbers')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Average Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
