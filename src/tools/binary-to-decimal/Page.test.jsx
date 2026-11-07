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

describe('Binary to Decimal Converter', () => {
  it('converts as you type and shows the working', () => {
    setup();
    fireEvent.change(field(), { target: { value: '1011' } });
    expect(screen.getAllByRole('region').find((item) => item.textContent === '11')).toBeTruthy();
    expect(screen.getAllByText(/Working/).length).toBeGreaterThan(0);
  });

  it('switches direction and keeps the answer', async () => {
    const user = setup();
    fireEvent.change(field(), { target: { value: '1011' } });
    await user.click(screen.getByRole('button', { name: 'Decimal to binary' }));
    expect(field()).toHaveValue('11');
    fireEvent.change(field(), { target: { value: '25' } });
    expect(screen.getAllByRole('region').find((item) => item.textContent === '11001')).toBeTruthy();
  });

  it('shows errors, copies and clears', async () => {
    const user = setup();
    fireEvent.change(field(), { target: { value: 'xyz' } });
    expect(screen.getByText(/is not a .* digit/)).toBeInTheDocument();
    fireEvent.change(field(), { target: { value: '1011' } });
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('= 11');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(field()).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Binary to Decimal Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
