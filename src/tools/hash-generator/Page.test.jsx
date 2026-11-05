import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Hash Generator page', () => {
  it('shows every hash for the current text', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your text'), { target: { value: 'abc' } });
    expect(await screen.findByText('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Uppercase'));
    expect(screen.getByText('900150983CD24FB0D6963F7D28E17F72')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });
});
