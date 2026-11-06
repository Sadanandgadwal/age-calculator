import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Split PDF page', () => {
  it('cannot split before a PDF is chosen', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Split PDF' })).toBeDisabled();
  });

  it('rejects a file that is not a PDF', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop a PDF/), { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } });
    expect(await screen.findByText('Please choose a PDF file.')).toBeInTheDocument();
  });
});
