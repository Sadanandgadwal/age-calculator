import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Image Cropper page', () => {
  it('shows no crop box before an image is chosen', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.queryByRole('application')).toBeNull();
    expect(screen.getByRole('button', { name: '16:9' })).toBeInTheDocument();
  });

  it('rejects a file that is not an image', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop an image/), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText(/choose an image file/)).toBeInTheDocument();
  });
});
