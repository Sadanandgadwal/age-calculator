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

const detail = (label) => screen.getByText(label, { selector: 'dt' }).parentElement;

describe('Color Code Converter', () => {
  it('shows a starting colour in every format', () => {
    setup();
    expect(detail('HEX')).toHaveTextContent('#0B6657');
    expect(detail('RGB')).toHaveTextContent('rgb(11, 102, 87)');
  });

  it('converts typed codes and picked colours', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Colour code'), { target: { value: 'rgb(26, 115, 232)' } });
    expect(detail('HEX')).toHaveTextContent('#1A73E8');
    expect(detail('CMYK')).toHaveTextContent('cmyk(89%, 50%, 0%, 9%)');
    fireEvent.change(screen.getByLabelText('Or pick a colour'), { target: { value: '#ff0000' } });
    expect(screen.getByLabelText('Colour code')).toHaveValue('#FF0000');
    expect(detail('HSL')).toHaveTextContent('hsl(0, 100%, 50%)');
  });

  it('shows errors, copies and clears', async () => {
    const user = setup();
    fireEvent.change(screen.getByLabelText('Colour code'), { target: { value: 'rgb(999, 0, 0)' } });
    expect(screen.getByText('RGB values must be from 0 to 255.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Colour code'), { target: { value: '#000' } });
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Contrast with white text: 21 : 1, passes AAA');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Colour code')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Color Code Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
