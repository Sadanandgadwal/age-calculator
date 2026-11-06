import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Image to Text page', () => {
  it('starts with no result and loads nothing', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByText(/Your results will appear here/)).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('rejects a file that is not an image', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop an image/), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText(/choose an image file/)).toBeInTheDocument();
  });
});
