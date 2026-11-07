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

describe('Shoe Size Converter', () => {
  it('starts with men’s UK 8', () => {
    setup();
    expect(detail('EU')).toHaveTextContent('42');
    expect(screen.getByRole('table', { name: 'Men’s shoes size chart' })).toBeInTheDocument();
  });

  it('changes chart, system and size', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Women’s shoes' }));
    await user.selectOptions(screen.getByLabelText('Size system'), '1');
    await user.selectOptions(screen.getByLabelText('Your size'), '7');
    expect(detail('UK')).toHaveTextContent('5');
    expect(detail('EU')).toHaveTextContent('37.5');
  });

  it('copies and resets', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('Your size'), '10');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Men’s shoes: UK 10 = US 10.5, EU 44.5');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Your size')).toHaveValue('8');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Shoe Size Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
