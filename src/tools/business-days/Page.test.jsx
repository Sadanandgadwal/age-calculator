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
const detail = (label) => screen.getByText(label, { selector: 'dt' }).parentElement;
const fill = () => {
  set('Start date', '2026-11-02');
  set('End date', '2026-11-08');
};

describe('Business Days Calculator', () => {
  it('shows working days, weekends and calendar days', async () => {
    const user = setup();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    fill();
    await calculate(user);

    expect(card('Working Days')).toHaveTextContent('5');
    expect(card('Weekend Days')).toHaveTextContent('2');
    expect(detail('Total Calendar Days')).toHaveTextContent('7 days');
    expect(detail('Weekend')).toHaveTextContent('Sunday, Saturday');
    expect(screen.getByRole('heading', { name: 'Working Days' })).toHaveFocus();
  });

  it('changes with the inclusive option', async () => {
    const user = setup();
    fill();
    await calculate(user);
    await user.click(screen.getByLabelText('Include the end date in the count'));
    expect(detail('Total Calendar Days')).toHaveTextContent('6 days');
    expect(detail('End Date Counted')).toHaveTextContent('No');
  });

  it('supports a configurable weekend', async () => {
    const user = setup();
    fill();
    await calculate(user);
    await user.click(screen.getByLabelText('Saturday'));
    expect(card('Working Days')).toHaveTextContent('6');

    await user.click(screen.getByLabelText('Friday'));
    expect(card('Working Days')).toHaveTextContent('5');
    expect(detail('Weekend')).toHaveTextContent('Sunday, Friday');
  });

  it('adds and removes holidays', async () => {
    const user = setup();
    fill();
    await calculate(user);
    set('Holiday date (optional)', '2026-11-04');
    await user.click(screen.getByRole('button', { name: 'Add holiday' }));

    expect(screen.getByLabelText('Holiday date (optional)')).toHaveValue('');
    expect(screen.getByRole('list', { name: 'Holidays' })).toHaveTextContent('4 Nov 2026');
    expect(card('Working Days')).toHaveTextContent('4');
    expect(card('Holidays')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'Remove 4 Nov 2026' }));
    expect(card('Working Days')).toHaveTextContent('5');
    expect(screen.queryByRole('list', { name: 'Holidays' })).not.toBeInTheDocument();
  });

  it('reports holiday errors', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Add holiday' }));
    expect(screen.getByText('Please choose a holiday date.')).toBeInTheDocument();

    set('Holiday date (optional)', '2026-11-04');
    await user.click(screen.getByRole('button', { name: 'Add holiday' }));
    set('Holiday date (optional)', '2026-11-04');
    await user.click(screen.getByRole('button', { name: 'Add holiday' }));
    expect(screen.getByText('This date is already in your list.')).toBeInTheDocument();
  });

  it('shows errors and focuses the first invalid field', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please choose an end date.')).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toHaveFocus();
  });

  it('copies and resets', async () => {
    const user = setup();
    fill();
    set('Holiday date (optional)', '2026-11-04');
    await user.click(screen.getByRole('button', { name: 'Add holiday' }));
    await user.click(screen.getByLabelText('Saturday'));
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Working days: 5');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('End date')).toHaveValue('');
    expect(screen.getByLabelText('Saturday')).toBeChecked();
    expect(screen.queryByRole('list', { name: 'Holidays' })).not.toBeInTheDocument();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Business Days Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
