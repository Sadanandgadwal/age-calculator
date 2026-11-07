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

const set = (id, value) => fireEvent.change(document.getElementById(id), { target: { value } });
const calculate = (user) => user.click(screen.getByRole('button', { name: 'Calculate' }));
const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;

describe('GPA Calculator', () => {
  it('works out a GPA on the 4.0 scale', async () => {
    const user = setup();
    set('gpa-1-grade', 'A');
    set('gpa-1-credits', '4');
    set('gpa-2-grade', 'B+');
    set('gpa-2-credits', '3');
    await calculate(user);
    expect(card('GPA out of 4')).toHaveTextContent('3.70');
    expect(card('Total credits')).toHaveTextContent('7');
    expect(screen.getByRole('heading', { name: 'Your GPA' })).toHaveFocus();
  });

  it('works out a cumulative GPA on the 10-point scale', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: '10-point scale' }));
    set('gpa-1-grade', 'O');
    set('gpa-1-credits', '4');
    set('gpa-previous', '8');
    set('gpa-previous-credits', '4');
    await calculate(user);
    expect(card('GPA out of 10')).toHaveTextContent('10.00');
    expect(card('Cumulative GPA')).toHaveTextContent('9.00');
  });

  it('adds and removes courses', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Add course' }));
    expect(screen.getAllByRole('group', { name: /^Course \d$/ })).toHaveLength(5);
    expect(document.getElementById('gpa-5-name')).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Remove course 5' }));
    expect(screen.getAllByRole('group', { name: /^Course \d$/ })).toHaveLength(4);
  });

  it('shows errors and focuses the first problem', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please add at least one course with a grade and credits.')).toBeInTheDocument();
    expect(document.getElementById('gpa-1-grade')).toHaveFocus();
  });

  it('copies and resets', async () => {
    const user = setup();
    set('gpa-1-grade', 'A');
    set('gpa-1-credits', '3');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('GPA: 4.00 out of 4');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(document.getElementById('gpa-1-credits')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'GPA Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
