import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';
import { TOOLS, getToolById } from '../../data/toolsRegistry.js';
import { getRelatedTools } from '../../utils/toolSearch.js';

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

describe('Temperature Converter', () => {
  it('starts on Celsius to Fahrenheit, with all three units', () => {
    setup();
    expect(screen.getByLabelText('From')).toHaveValue('c');
    expect(screen.getByLabelText('To')).toHaveValue('f');
    expect(screen.getByLabelText('From').querySelectorAll('option')).toHaveLength(3);
  });

  it('converts instantly, with the formula', () => {
    setup();
    type('100');
    expect(screen.getByText('212 °F')).toBeInTheDocument();
    expect(screen.getAllByText('100 °C = 212 °F').length).toBeGreaterThan(0);
    expect(screen.getByText('Formula').parentElement).toHaveTextContent('°F = (°C × 9/5) + 32');
    expect(screen.queryByText('Conversion Rate')).not.toBeInTheDocument();
  });

  it('accepts negative temperatures, but not below absolute zero', () => {
    setup();
    type('-40');
    expect(screen.getAllByText('-40 °C = -40 °F').length).toBeGreaterThan(0);

    type('-300');
    expect(screen.getByText(/below absolute zero/, { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('swaps units and keeps the value', async () => {
    const user = setup();
    type('212');
    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(screen.getByLabelText('From')).toHaveValue('f');
    expect(screen.getAllByText('212 °F = 100 °C').length).toBeGreaterThan(0);
  });

  it('resets the value and units', async () => {
    const user = setup();
    type('5');
    await user.selectOptions(screen.getByLabelText('To'), 'k');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Value')).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('f');
  });

  it('copies the result', async () => {
    const user = setup();
    type('0');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    const copied = await navigator.clipboard.readText();
    expect(copied).toContain('0 °C = 32 °F');
    expect(copied).toContain('Formula: °F = (°C × 9/5) + 32');
    expect(copied).not.toContain('undefined');
  });

  it('has the required sections and related converters', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Temperature Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    for (const { name, categories } of getRelatedTools(TOOLS, getToolById('temperature-converter'))) {
      expect(categories).toContain('converters');
      expect(screen.getByRole('link', { name: `Open Tool: ${name}` })).toBeInTheDocument();
    }
  });
});
