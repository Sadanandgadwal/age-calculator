import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitConverter from './UnitConverter.jsx';
import { WEIGHT_UNITS } from '../../tools/weight/logic.js';

function setup(props) {
  const user = userEvent.setup();
  render(<UnitConverter units={WEIGHT_UNITS} defaultFrom="kg" defaultTo="g" {...props} />);
  return user;
}

const value = () => screen.getByLabelText('Value');
const type = (text) => fireEvent.change(value(), { target: { value: text } });

describe('UnitConverter', () => {
  it('starts empty, with the default units', () => {
    setup();
    expect(value()).toHaveValue('');
    expect(screen.getByLabelText('From')).toHaveValue('kg');
    expect(screen.getByLabelText('To')).toHaveValue('g');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('lists every unit', () => {
    setup();
    expect(screen.getByLabelText('From').querySelectorAll('option')).toHaveLength(WEIGHT_UNITS.length);
    expect(screen.getAllByRole('option', { name: 'Metric tonne (t)' })).toHaveLength(2);
  });

  it('converts instantly, with the formula', () => {
    setup();
    type('2.5');

    expect(screen.getAllByText('2.5 kg = 2,500 g').length).toBeGreaterThan(0);
    expect(screen.getByText('Gram = Kilogram × 1,000')).toBeInTheDocument();
    expect(screen.getByText('1 kg = 1,000 g')).toBeInTheDocument();
  });

  it('updates when a unit changes', async () => {
    const user = setup();
    type('1');
    await user.selectOptions(screen.getByLabelText('To'), 'lb');
    expect(screen.getAllByText('1 kg ≈ 2.204622622 lb').length).toBeGreaterThan(0);
  });

  it('swaps units and keeps the value', async () => {
    const user = setup();
    type('1000');
    await user.click(screen.getByRole('button', { name: 'Swap units' }));

    expect(screen.getByLabelText('From')).toHaveValue('g');
    expect(screen.getByLabelText('To')).toHaveValue('kg');
    expect(value()).toHaveValue('1000');
    expect(screen.getAllByText('1,000 g = 1 kg').length).toBeGreaterThan(0);
  });

  it('clears the value but keeps the units', async () => {
    const user = setup();
    type('5');
    await user.selectOptions(screen.getByLabelText('To'), 'lb');
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(value()).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('lb');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('shows errors instead of a result', () => {
    setup();
    type('abc');
    expect(screen.getByText('Please enter a valid number.')).toBeInTheDocument();
    expect(value()).toHaveAttribute('aria-invalid', 'true');

    type('-1');
    expect(screen.getByText('Please enter a value of 0 or more.')).toBeInTheDocument();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('copies the result', async () => {
    const user = setup();
    type('2');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));

    expect(await navigator.clipboard.readText()).toContain('2 kg = 2,000 g');
    expect(screen.getByText('Results copied to clipboard.')).toBeInTheDocument();
  });

  it('can reset the units as well as the value', async () => {
    const user = setup({ resetsUnits: true });
    type('5');
    await user.selectOptions(screen.getByLabelText('To'), 'lb');
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(value()).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('g');
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('can use custom conversion logic, with no conversion rate', () => {
    const evaluate = (text) => (text ? { result: { summary: 'Custom', formula: 'Custom formula', outputText: '42', to: { name: 'Answer' } } } : {});
    setup({ evaluate });
    type('1');
    expect(screen.getByText('Custom formula')).toBeInTheDocument();
    expect(screen.queryByText('Conversion Rate')).not.toBeInTheDocument();
  });

  it('shows extra details when provided', () => {
    setup({ getExtraDetails: ({ output }) => [{ label: 'Extra', value: `${output} extra` }] });
    type('1');
    expect(screen.getByText('1000 extra')).toBeInTheDocument();
  });
});
