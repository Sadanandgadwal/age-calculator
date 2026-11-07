import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Unlock PDF page', () => {
  it('waits for a protected PDF', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Unlock PDF' })).toBeDisabled();
  });

  it('rejects a file that is not a PDF', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop a PDF/), { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } });
    expect(await screen.findByText('Please choose a PDF file.')).toBeInTheDocument();
  });
});
