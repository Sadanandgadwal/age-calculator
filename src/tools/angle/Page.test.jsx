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

describe('Angle Converter', () => {
  it('offers every unit', () => {
    setup();
    expect([...screen.getByLabelText('From').querySelectorAll('option')].map(({ value }) => value)).toEqual(['deg', 'rad', 'grad']);
  });

  it('converts instantly, including negative angles', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('To'), 'grad');
    type('-45');
    expect(screen.getAllByText('-45 deg = -50 grad').length).toBeGreaterThan(0);
    expect(screen.queryByText('Please enter a value of 0 or more.')).not.toBeInTheDocument();
  });

  it('swaps units and keeps the value', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('To'), 'grad');
    type('100');
    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(screen.getByLabelText('From')).toHaveValue('grad');
    expect(screen.getAllByText('100 grad = 90 deg').length).toBeGreaterThan(0);
  });

  it('shows an error for invalid input', () => {
    setup();
    type('abc');
    expect(screen.getByText('Please enter a valid number.')).toBeInTheDocument();
  });

  it('resets and copies', async () => {
    const user = setup();
    type('180');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('180 deg ≈ 3.141592654 rad');

    await user.selectOptions(screen.getByLabelText('To'), 'grad');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Value')).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('rad');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Angle Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
