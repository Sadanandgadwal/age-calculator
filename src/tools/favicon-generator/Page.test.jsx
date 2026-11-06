import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Favicon Generator page', () => {
  it('rejects a file that is not an image', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop an image/), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText(/choose an image file/)).toBeInTheDocument();
  });

  it('shows the color picker only for a color background', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.queryByLabelText('Background color')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Color' }));
    expect(screen.getByLabelText('Background color')).toHaveValue('#ffffff');
  });
});
