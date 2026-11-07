import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const setup = () => render(<MemoryRouter><Page /></MemoryRouter>);

describe('Compress PDF page', () => {
  it('cannot compress before a PDF is chosen', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Compress PDF' })).toBeDisabled();
  });

  it('rejects a file that is not a PDF', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Choose or drop a PDF/), { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } });
    expect(await screen.findByText('Please choose a PDF file.')).toBeInTheDocument();
  });

  it('explains each level', async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByRole('button', { name: 'Recommended' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Strong' }));
    expect(screen.getByText('Smallest file, lower image quality.')).toBeInTheDocument();
  });
});
