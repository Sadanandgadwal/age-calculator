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

const field = () => screen.getByLabelText('Calculation');
const calculate = (user) => user.click(screen.getByRole('button', { name: 'Calculate' }));
const card = () => screen.getByText('Answer', { selector: 'span' }).parentElement;

describe('Scientific Calculator', () => {
  it('works out a typed calculation', async () => {
    const user = setup();
    fireEvent.change(field(), { target: { value: '2+3×4' } });
    await calculate(user);
    expect(card()).toHaveTextContent('14');
    expect(screen.getByRole('heading', { name: 'Your Answer' })).toHaveFocus();
  });

  it('builds a calculation from the keys', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Square root' }));
    for (const key of ['1', '4', '4', ')', 'Plus', '5', 'n!, factorial']) await user.click(screen.getByRole('button', { name: key }));
    expect(field()).toHaveValue('√(144)+5!');
    await calculate(user);
    expect(card()).toHaveTextContent('132');
  });

  it('deletes the last character', async () => {
    const user = setup();
    fireEvent.change(field(), { target: { value: '123' } });
    await user.click(screen.getByRole('button', { name: 'Delete last character' }));
    expect(field()).toHaveValue('12');
  });

  it('switches to radians', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Radians' }));
    fireEvent.change(field(), { target: { value: 'sin(π/2)' } });
    await calculate(user);
    expect(card()).toHaveTextContent('1');
    expect(screen.getByText('Angle mode').parentElement).toHaveTextContent('Radians');
  });

  it('reuses the answer and keeps earlier answers', async () => {
    const user = setup();
    fireEvent.change(field(), { target: { value: '6×7' } });
    await calculate(user);
    fireEvent.change(field(), { target: { value: 'Ans+1' } });
    await calculate(user);
    expect(card()).toHaveTextContent('43');
    expect(screen.getByRole('region', { name: 'Earlier answers' })).toHaveTextContent('6×7 = 42');
  });

  it('keeps a value in memory', async () => {
    const user = setup();
    fireEvent.change(field(), { target: { value: '10' } });
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'M+, add answer to memory' }));
    await user.click(screen.getByRole('button', { name: 'M+, add answer to memory' }));
    expect(screen.getByText('Memory').parentElement).toHaveTextContent('20');
    fireEvent.change(field(), { target: { value: '' } });
    await user.click(screen.getByRole('button', { name: 'MR, recall memory' }));
    expect(field()).toHaveValue('20');
    await user.click(screen.getByRole('button', { name: 'MC, clear memory' }));
    expect(screen.queryByText('Memory')).not.toBeInTheDocument();
  });

  it('shows errors on the field', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter a calculation.')).toBeInTheDocument();
    expect(field()).toHaveFocus();
    fireEvent.change(field(), { target: { value: '5/0' } });
    await calculate(user);
    expect(screen.getByText('You cannot divide by zero.')).toBeInTheDocument();
  });

  it('copies and resets', async () => {
    const user = setup();
    fireEvent.change(field(), { target: { value: '2^10' } });
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toBe('2^10 = 1024');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(field()).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Scientific Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
