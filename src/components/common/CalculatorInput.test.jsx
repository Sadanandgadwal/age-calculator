import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CalculatorInput from './CalculatorInput.jsx';

describe('CalculatorInput', () => {
  it('adds an extra class without losing its own styles', () => {
    render(<CalculatorInput id="value" label="Value" value="" onChange={() => {}} className="font-mono" />);
    const input = screen.getByLabelText('Value');
    expect(input).toHaveClass('font-mono', 'min-h-12', 'border-2');
  });
});
