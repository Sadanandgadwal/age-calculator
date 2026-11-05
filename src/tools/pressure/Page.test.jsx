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

describe('Pressure Converter', () => {
  it('offers every unit', () => {
    setup();
    expect([...screen.getByLabelText('From').querySelectorAll('option')].map(({ value }) => value)).toEqual(['psi', 'bar', 'pa', 'kpa', 'atm']);
  });

  it('converts instantly, and swaps', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('From'), 'bar');
    await user.selectOptions(screen.getByLabelText('To'), 'kpa');
    type('2');
    expect(screen.getAllByText('2 bar = 200 kPa').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(screen.getByLabelText('From')).toHaveValue('kpa');
    expect(screen.getAllByText('2 kPa = 0.02 bar').length).toBeGreaterThan(0);
  });

  it('shows an error for negative values', () => {
    setup();
    type('-1');
    expect(screen.getByText('Please enter a value of 0 or more.')).toBeInTheDocument();
  });

  it('resets and copies', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('From'), 'atm');
    await user.selectOptions(screen.getByLabelText('To'), 'pa');
    type('1');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('1 atm = 1,01,325 Pa');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Value')).toHaveValue('');
    expect(screen.getByLabelText('From')).toHaveValue('psi');
    expect(screen.getByLabelText('To')).toHaveValue('bar');
  });

  it('has the required sections and related converters', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Pressure Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Open Tool: KG to Gram Converter' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open Tool: Age Calculator' })).not.toBeInTheDocument();
  });
});
