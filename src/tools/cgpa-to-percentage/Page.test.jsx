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

const set = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const calculate = (user) => user.click(screen.getByRole('button', { name: 'Calculate' }));
const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;

describe('CGPA to Percentage Calculator', () => {
  it('converts with the CBSE formula', async () => {
    const user = setup();
    set('CGPA (out of 10)', '8.6');
    await calculate(user);
    expect(card('Percentage')).toHaveTextContent('81.7%');
    expect(screen.getByText('Conversion used').parentElement).toHaveTextContent('Percentage = CGPA × 9.5');
    expect(screen.getByRole('heading', { name: 'Your Percentage' })).toHaveFocus();
  });

  it('switches formula and uses a custom multiplier', async () => {
    const user = setup();
    set('CGPA (out of 10)', '8.25');
    await user.selectOptions(screen.getByLabelText('Conversion formula'), 'vtu');
    await calculate(user);
    expect(card('Percentage')).toHaveTextContent('75%');
    await user.selectOptions(screen.getByLabelText('Conversion formula'), 'custom');
    set('Multiplier', '10');
    expect(card('Percentage')).toHaveTextContent('82.5%');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    await calculate(user);
    expect(screen.getByText('Please enter your CGPA.')).toBeInTheDocument();
    expect(screen.getByLabelText('CGPA (out of 10)')).toHaveFocus();
    set('CGPA (out of 10)', '9');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Percentage: 85.5%');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('CGPA (out of 10)')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'CGPA to Percentage Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
