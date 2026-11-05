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

describe('Energy Converter', () => {
  it('offers every unit, with calories and kilocalories separate', () => {
    setup();
    expect([...screen.getByLabelText('From').querySelectorAll('option')].map(({ value }) => value)).toEqual(['j', 'cal', 'kcal', 'kwh', 'btu']);
    expect(screen.getAllByRole('option', { name: 'Calorie (cal)' })).toHaveLength(2);
    expect(screen.getAllByRole('option', { name: 'Kilocalorie (kcal)' })).toHaveLength(2);
  });

  it('converts instantly, and swaps', async () => {
    const user = setup();
    type('2');
    expect(screen.getAllByText('2 kcal = 8,368 J').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(screen.getByLabelText('From')).toHaveValue('j');
    expect(screen.getByLabelText('To')).toHaveValue('kcal');
  });

  it('shows an error for negative values', () => {
    setup();
    type('-1');
    expect(screen.getByText('Please enter a value of 0 or more.')).toBeInTheDocument();
  });

  it('resets and copies', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('To'), 'cal');
    type('1.5');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('1.5 kcal = 1,500 cal');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Value')).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('j');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Energy Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
