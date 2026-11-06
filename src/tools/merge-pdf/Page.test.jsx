import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Merge PDF page', () => {
  it('cannot merge until two files are added', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Merge PDFs' })).toBeDisabled();
  });

  it('lists a file that is not a PDF as not added', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop PDF files/), { target: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] } });
    expect(await screen.findByText('Please choose a PDF file.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: /Files to merge/ })).toBeNull();
  });
});
