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

const type = (text) => fireEvent.change(screen.getByLabelText('Value'), { target: { value: text } });

describe('KG to Gram Converter', () => {
  it('starts on kilograms to grams, with every unit available', () => {
    setup();
    expect(screen.getByLabelText('From')).toHaveValue('kg');
    expect(screen.getByLabelText('To')).toHaveValue('g');
    expect([...screen.getByLabelText('From').querySelectorAll('option')].map(({ value }) => value)).toEqual(['kg', 'g', 'mg', 't', 'lb', 'oz']);
  });

  it('converts instantly and swaps', async () => {
    const user = setup();
    type('2.5');
    expect(screen.getAllByText('2.5 kg = 2,500 g').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(screen.getAllByText('2.5 g = 0.0025 kg').length).toBeGreaterThan(0);
  });

  it('does not show a feet and inches value', () => {
    setup();
    type('1');
    expect(screen.queryByText('Feet and Inches')).not.toBeInTheDocument();
  });

  it('shows the common examples', () => {
    setup();
    expect(screen.getByText('1 kg = 1,000 g')).toBeInTheDocument();
    expect(screen.getByText('1 g = 1,000 mg')).toBeInTheDocument();
    expect(screen.getByText('1 kg ≈ 2.20462 lb')).toBeInTheDocument();
    expect(screen.getByText('1 lb ≈ 453.592 g')).toBeInTheDocument();
  });

  it('has the required page sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'KG to Gram Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Open Tool: CM to Feet Converter' })).toBeInTheDocument();
  });
});
