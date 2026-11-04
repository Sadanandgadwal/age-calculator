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

const type = (text) => fireEvent.change(screen.getByLabelText('Value'), { target: { value: text } });

describe('Time Unit Converter', () => {
  it('offers every unit', () => {
    setup();
    expect([...screen.getByLabelText('From').querySelectorAll('option')].map(({ value }) => value)).toEqual(['s', 'min', 'h', 'day', 'week', 'year']);
  });

  it('converts instantly, and swaps', async () => {
    const user = setup();
    type('1.5');
    expect(screen.getAllByText('1.5 h = 90 min').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(screen.getByLabelText('From')).toHaveValue('min');
    expect(screen.getAllByText('1.5 min = 0.025 h').length).toBeGreaterThan(0);
  });

  it('explains the year convention only when years are used', async () => {
    const user = setup();
    type('2');
    expect(screen.queryByText('Year Convention')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('From'), 'year');
    await user.selectOptions(screen.getByLabelText('To'), 'day');
    expect(screen.getByText('Year Convention').parentElement).toHaveTextContent('1 year = 365.25 days');
    expect(screen.getAllByText('2 yr = 730.5 d').length).toBeGreaterThan(0);
  });

  it('shows an error for negative values', () => {
    setup();
    type('-1');
    expect(screen.getByText('Please enter a value of 0 or more.')).toBeInTheDocument();
  });

  it('copies the result with the year convention, and resets', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('From'), 'year');
    await user.selectOptions(screen.getByLabelText('To'), 'day');
    type('1');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Year Convention: 1 year = 365.25 days');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Value')).toHaveValue('');
    expect(screen.getByLabelText('From')).toHaveValue('h');
    expect(screen.getByLabelText('To')).toHaveValue('min');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Time Unit Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
