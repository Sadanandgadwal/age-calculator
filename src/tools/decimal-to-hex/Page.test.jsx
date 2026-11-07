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

const field = () => screen.getByRole('textbox');

describe('Decimal to Hex Converter', () => {
  it('converts as you type and shows the working', () => {
    setup();
    fireEvent.change(field(), { target: { value: '255' } });
    expect(screen.getAllByRole('region').find((item) => item.textContent === 'FF')).toBeTruthy();
    expect(screen.getAllByText(/Working/).length).toBeGreaterThan(0);
  });

  it('switches direction and keeps the answer', async () => {
    const user = setup();
    fireEvent.change(field(), { target: { value: '255' } });
    await user.click(screen.getByRole('button', { name: 'Hex to decimal' }));
    expect(field()).toHaveValue('FF');
    fireEvent.change(field(), { target: { value: 'ff' } });
    expect(screen.getAllByRole('region').find((item) => item.textContent === '255')).toBeTruthy();
  });

  it('shows errors, copies and clears', async () => {
    const user = setup();
    fireEvent.change(field(), { target: { value: 'xyz' } });
    expect(screen.getByText(/is not a .* digit/)).toBeInTheDocument();
    fireEvent.change(field(), { target: { value: '255' } });
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('= FF');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(field()).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Decimal to Hex Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
