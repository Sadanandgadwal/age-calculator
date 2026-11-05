import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Image to Base64 page', () => {
  it('rejects a file that is not an image', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop an image/), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText(/choose an image file/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Copy results/ })).toBeNull();
  });

  it('rejects an image over 10 MB', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    const big = new File(['x'], 'a.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: 11 * 1024 * 1024 });
    fireEvent.change(screen.getByLabelText(/Choose or drop an image/), { target: { files: [big] } });
    expect(await screen.findByText(/larger than 10 MB/)).toBeInTheDocument();
  });
});
