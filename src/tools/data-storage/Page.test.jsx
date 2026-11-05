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

describe('Data Storage Converter', () => {
  it('offers every decimal and binary unit, named distinctly', () => {
    setup();
    expect([...screen.getByLabelText('From').querySelectorAll('option')].map(({ value }) => value)).toEqual(['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'kib', 'mib', 'gib', 'tib', 'pib']);
    expect(screen.getAllByRole('option', { name: 'Gigabyte (GB)' })).toHaveLength(2);
    expect(screen.getAllByRole('option', { name: 'Gibibyte (GiB)' })).toHaveLength(2);
  });

  it('converts instantly, and swaps', async () => {
    const user = setup();
    type('2');
    expect(screen.getAllByText('2 GB = 2,000 MB').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(screen.getByLabelText('From')).toHaveValue('mb');
    expect(screen.getAllByText('2 MB = 0.002 GB').length).toBeGreaterThan(0);
  });

  it('shows binary sizes exactly', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('From'), 'tib');
    await user.selectOptions(screen.getByLabelText('To'), 'b');
    type('1');
    expect(screen.getAllByText('1 TiB = 10,99,51,16,27,776 B').length).toBeGreaterThan(0);
  });

  it('shows an error for negative values', () => {
    setup();
    type('-1');
    expect(screen.getByText('Please enter a value of 0 or more.')).toBeInTheDocument();
  });

  it('resets and copies', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('To'), 'gib');
    type('1');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('1 GB ≈ 0.93132257461548 GiB');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Value')).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('mb');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Data Storage Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
