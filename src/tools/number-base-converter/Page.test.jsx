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

const output = () => screen.getByRole('region', { name: /^(Binary|Octal|Decimal|Hexadecimal|Base \d+)$/ });

describe('Number Base Converter', () => {
  it('converts as you type', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Number'), { target: { value: '255' } });
    expect(output()).toHaveTextContent('11111111');
    expect(screen.getByText('Hexadecimal', { selector: 'dt' }).parentElement).toHaveTextContent('FF');
  });

  it('changes bases and swaps', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('From'), '16');
    await user.selectOptions(screen.getByLabelText('To'), '10');
    fireEvent.change(screen.getByLabelText('Number'), { target: { value: 'ff' } });
    expect(output()).toHaveTextContent('255');
    await user.click(screen.getByRole('button', { name: 'Swap bases' }));
    expect(screen.getByLabelText('Number')).toHaveValue('255');
    expect(output()).toHaveTextContent('FF');
  });

  it('shows errors, copies and clears', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('From'), '2');
    fireEvent.change(screen.getByLabelText('Number'), { target: { value: '102' } });
    expect(screen.getByText('"2" is not a binary digit. Use 0 to 1.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Number'), { target: { value: '101' } });
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('101 (binary) = 101 (binary)');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Number')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Number Base Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
