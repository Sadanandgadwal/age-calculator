import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('PDF Page Counter page', () => {
  it('lists a file that is not a PDF as unreadable', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop PDF files/), { target: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] } });
    expect(await screen.findByText('Please choose a PDF file.')).toBeInTheDocument();
    expect(screen.getByText('Could not be read')).toBeInTheDocument();
  });
});
