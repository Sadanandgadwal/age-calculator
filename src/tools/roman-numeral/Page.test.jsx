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

const set = (value) => fireEvent.change(screen.getByLabelText('Number or Roman numeral'), { target: { value } });

describe('Roman Numeral Converter', () => {
  it('turns a number into a numeral', () => {
    setup();
    set('2026');
    expect(screen.getByText('Roman numeral for 2026').parentElement).toHaveTextContent('MMXXVI');
  });

  it('turns a numeral into a number', () => {
    setup();
    set('mcmxciv');
    expect(screen.getByText('Value of MCMXCIV').parentElement).toHaveTextContent('1,994');
    expect(screen.getByText('Parts').parentElement).toHaveTextContent('M = 1,000, CM = 900, XC = 90, IV = 4');
  });

  it('shows errors, copies and clears', async () => {
    const user = setup();
    set('IIII');
    expect(screen.getByText('IIII is not a correctly written Roman numeral. Did you mean IV (4)?')).toBeInTheDocument();
    set('14');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('14 = XIV');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Number or Roman numeral')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Roman Numeral Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
