import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Image Resizer page', () => {
  it('keeps the size fields off until an image is chosen', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByLabelText('Width')).toBeDisabled();
    expect(screen.getByLabelText('Height')).toBeDisabled();
  });

  it('rejects a file that is not an image', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop an image/), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText(/choose an image file/)).toBeInTheDocument();
  });

  it('switches to a percent', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Percent' }));
    expect(screen.getByLabelText(/Percent of the original/)).toHaveValue('50');
  });
});
