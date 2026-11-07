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

const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;

describe('Cooking Converter', () => {
  it('turns cups of flour into grams', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1' } });
    expect(card('Gram')).toHaveTextContent('125.39');
  });

  it('changes ingredient and units, and swaps', async () => {
    const user = setup();
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '2' } });
    await user.selectOptions(screen.getByLabelText('Ingredient'), 'sugar');
    await user.selectOptions(screen.getByLabelText('From'), 'tbsp');
    await user.selectOptions(screen.getByLabelText('To'), 'tsp');
    expect(card('Teaspoon (US)')).toHaveTextContent('6');
    expect(screen.getByText(/does not change volume-to-volume/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(screen.getByLabelText('From')).toHaveValue('tsp');
  });

  it('shows errors, copies and resets', async () => {
    const user = setup();
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: 'x' } });
    expect(screen.getByText('Please enter a number, without commas or symbols.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1' } });
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('1 cup of all-purpose flour (maida) = 125.39 g');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Amount')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Cooking Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
