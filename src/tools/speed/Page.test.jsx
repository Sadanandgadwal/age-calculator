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

describe('Speed Converter', () => {
  it('offers every unit', () => {
    setup();
    expect([...screen.getByLabelText('From').querySelectorAll('option')].map(({ value }) => value)).toEqual(['kmh', 'mph', 'ms', 'kn']);
  });

  it('converts instantly, and swaps', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('From'), 'ms');
    await user.selectOptions(screen.getByLabelText('To'), 'kmh');
    type('10');
    expect(screen.getAllByText('10 m/s = 36 km/h').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(screen.getByLabelText('From')).toHaveValue('kmh');
    expect(screen.getAllByText('10 km/h ≈ 2.777777778 m/s').length).toBeGreaterThan(0);
  });

  it('shows an error for negative values', () => {
    setup();
    type('-1');
    expect(screen.getByText('Please enter a value of 0 or more.')).toBeInTheDocument();
  });

  it('resets and copies', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('To'), 'ms');
    type('36');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('36 km/h = 10 m/s');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Value')).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('mph');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Speed Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
