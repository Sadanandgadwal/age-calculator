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

describe('Volume Converter', () => {
  it('offers every unit, naming each gallon', () => {
    setup();
    expect([...screen.getByLabelText('From').querySelectorAll('option')].map(({ value }) => value)).toEqual(['l', 'ml', 'usgal', 'ukgal', 'cup', 'm3']);
    expect(screen.getAllByRole('option', { name: 'US gallon (US gal)' })).toHaveLength(2);
    expect(screen.getAllByRole('option', { name: 'UK gallon (UK gal)' })).toHaveLength(2);
  });

  it('converts instantly, and swaps', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('From'), 'usgal');
    await user.selectOptions(screen.getByLabelText('To'), 'cup');
    type('2');
    expect(screen.getAllByText('2 US gal = 32 US cup').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(screen.getByLabelText('From')).toHaveValue('cup');
    expect(screen.getByLabelText('To')).toHaveValue('usgal');
  });

  it('shows an error for negative values', () => {
    setup();
    type('-1');
    expect(screen.getByText('Please enter a value of 0 or more.')).toBeInTheDocument();
  });

  it('resets and copies', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('To'), 'ml');
    type('1.5');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('1.5 L = 1,500 mL');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Value')).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('usgal');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Volume Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
