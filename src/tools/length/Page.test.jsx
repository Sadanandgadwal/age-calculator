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

describe('CM to Feet Converter', () => {
  it('starts on centimeters to feet, with every unit available', () => {
    setup();
    expect(screen.getByLabelText('From')).toHaveValue('cm');
    expect(screen.getByLabelText('To')).toHaveValue('ft');
    expect(screen.getByLabelText('From').querySelectorAll('option')).toHaveLength(8);
  });

  it('shows the combined feet and inches value', () => {
    setup();
    type('170');
    expect(screen.getByText('Feet and Inches').parentElement).toHaveTextContent('5 ft 6.93 in');
  });

  it('swaps units', async () => {
    const user = setup();
    type('1');
    await user.click(screen.getByRole('button', { name: 'Swap units' }));

    expect(screen.getByLabelText('From')).toHaveValue('ft');
    expect(screen.getByLabelText('To')).toHaveValue('cm');
    expect(screen.getAllByText('1 ft = 30.48 cm').length).toBeGreaterThan(0);
    expect(screen.queryByText('Feet and Inches')).not.toBeInTheDocument();
  });

  it('includes feet and inches in copied results', async () => {
    const user = setup();
    type('170');
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Feet and Inches: 5 ft 6.93 in');
  });

  it('has the required page sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'CM to Feet Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Open Tool: KG to Gram Converter' })).toBeInTheDocument();
  });
});
