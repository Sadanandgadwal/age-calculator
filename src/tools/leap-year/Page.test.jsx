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

const setYear = (value) => fireEvent.change(screen.getByLabelText('Year'), { target: { value } });
const calculate = (user) => user.click(screen.getByRole('button', { name: 'Calculate' }));
const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;
const detail = (label) => screen.getByText(label, { selector: 'dt' }).parentElement;

describe('Leap Year Checker', () => {
  it('shows a leap year with its explanation', async () => {
    const user = setup();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    setYear('2024');
    await calculate(user);

    expect(card('Leap Year')).toHaveTextContent('Yes');
    expect(card('Next Leap Year')).toHaveTextContent('2028');
    expect(card('Previous Leap Year')).toHaveTextContent('2020');
    expect(screen.getByText('2024 is a leap year because it divides evenly by 4 and is not a century year.')).toBeInTheDocument();
    expect(detail('Days in February')).toHaveTextContent('29');
    expect(screen.getByRole('heading', { name: 'Your Result' })).toHaveFocus();
  });

  it('handles the century rule', async () => {
    const user = setup();
    setYear('1900');
    await calculate(user);
    expect(card('Leap Year')).toHaveTextContent('No');
    expect(card('Next Leap Year')).toHaveTextContent('1904');
    expect(detail('Divides by 100')).toHaveTextContent('Yes');
    expect(detail('Divides by 400')).toHaveTextContent('No');

    setYear('2000');
    expect(card('Leap Year')).toHaveTextContent('Yes');
  });

  it('shows an error and focuses the field', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter a year.')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toHaveFocus();
  });

  it('copies and resets', async () => {
    const user = setup();
    setYear('2024');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Next leap year: 2028');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Year')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Leap Year Checker' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
