import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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

const detail = (label) => screen.getByText(label, { selector: 'dt' }).parentElement;

describe('Clothing Size Converter', () => {
  it('starts with men’s M', () => {
    setup();
    expect(detail('India')).toHaveTextContent('40');
    expect(screen.getByRole('table', { name: 'Men’s shirts and tops size chart' })).toBeInTheDocument();
  });

  it('keeps the same size when the system changes', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('Size system'), '4');
    expect(screen.getByLabelText('Your size')).toHaveValue('48');
  });

  it('switches to the women’s chart', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Women’s tops and dresses' }));
    await user.selectOptions(screen.getByLabelText('Size system'), '3');
    await user.selectOptions(screen.getByLabelText('Your size'), '10');
    expect(detail('EU')).toHaveTextContent('38');
    expect(detail('Bust (cm)')).toHaveTextContent('88–91');
  });

  it('copies and resets', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Letter M = India 40');
    await user.selectOptions(screen.getByLabelText('Your size'), 'XL');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Your size')).toHaveValue('M');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Clothing Size Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
