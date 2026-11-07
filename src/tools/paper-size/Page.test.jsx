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

describe('Paper Size Converter', () => {
  it('shows A4 to begin with', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'A4, portrait' })).toBeInTheDocument();
    expect(detail('Pixels at 300 DPI')).toHaveTextContent('2,480 × 3,508 px');
  });

  it('changes paper, orientation and resolution', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('Paper size'), 'letter');
    await user.click(screen.getByRole('button', { name: 'Landscape' }));
    await user.click(screen.getByRole('button', { name: '96 DPI' }));
    expect(screen.getByRole('heading', { name: 'Letter, landscape' })).toBeInTheDocument();
    expect(detail('Pixels at 96 DPI')).toHaveTextContent('1,056 × 816 px');
  });

  it('copies and resets', async () => {
    const user = setup();
    await user.selectOptions(screen.getByLabelText('Paper size'), 'a3');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Millimetres: 297 × 420 mm');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Paper size')).toHaveValue('a4');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Paper Size Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
