import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const type = (value) => fireEvent.change(screen.getByLabelText('Text or link'), { target: { value } });

describe('QR Code Generator page', () => {
  it('draws the code live, with download buttons', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    type('https://example.com');
    expect(screen.getByRole('img', { name: 'QR code for https://example.com' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download PNG' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download SVG' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print/ })).toBeInTheDocument();
  });

  it('explains text that is too long', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    type('x'.repeat(4000));
    expect(screen.getByText(/too long for a QR code/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Download PNG' })).toBeNull();
  });
});
