import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Passport Photo Maker page', () => {
  it('rejects a file that is not an image', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop a photo/), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText(/choose an image file/)).toBeInTheDocument();
  });

  it('checks a custom size', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Custom' }));
    await user.clear(screen.getByLabelText('Width'));
    await user.type(screen.getByLabelText('Width'), '5');
    expect(screen.getByText(/20 to 100 mm/)).toBeInTheDocument();
  });
});
