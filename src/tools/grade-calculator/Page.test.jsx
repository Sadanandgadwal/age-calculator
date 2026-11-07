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

describe('Grade Calculator', () => {
  it('works out the weighted score and grade', async () => {
    const user = setup();
    set('assessment-1-score', '90');
    set('assessment-1-weight', '50');
    set('assessment-2-score', '80');
    set('assessment-2-weight', '50');
    await calculate(user);
    expect(card('Weighted score')).toHaveTextContent('85%');
    expect(card('Grade')).toHaveTextContent('A');
    expect(screen.getByRole('heading', { name: 'Your Grade' })).toHaveFocus();
  });

  it('shows the score needed for a target', async () => {
    const user = setup();
    set('assessment-1-score', '80');
    set('assessment-1-weight', '20');
    set('assessment-2-score', '70');
    set('assessment-2-weight', '30');
    set('grade-target', '75');
    await calculate(user);
    expect(screen.getByText('You need 76% on the remaining 50% to finish with 75%.')).toBeInTheDocument();
  });

  it('uses the chosen grading scale', async () => {
    const user = setup();
    set('assessment-1-score', '65');
    set('assessment-1-weight', '100');
    await calculate(user);
    await user.click(screen.getByText('Grading scale'));
    await user.selectOptions(screen.getByLabelText('Scale'), 'division');
    expect(card('Grade')).toHaveTextContent('First');
  });

  it('adds and removes items', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(document.getElementById('assessment-4-name')).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Remove item 4' }));
    expect(document.getElementById('assessment-4-name')).toBeNull();
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter at least one score and its weight.')).toBeInTheDocument();
    expect(document.getElementById('assessment-1-score')).toHaveFocus();
    set('assessment-1-score', '70');
    set('assessment-1-weight', '100');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Weighted score: 70%');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(document.getElementById('assessment-1-score')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Grade Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
