import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYPj/HwADAgH/h0Bh2AAAAABJRU5ErkJggg==';
const paste = (value) => fireEvent.change(screen.getByLabelText(/Base64 text or data URI/), { target: { value } });

afterEach(() => vi.unstubAllGlobals());

describe('Base64 to Image page', () => {
  it('shows an error for text that is not an image', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    paste(btoa('hello'));
    expect(screen.getByText(/not a supported image/)).toBeInTheDocument();
  });

  it('offers the download only after the image has opened', () => {
    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();
    render(<MemoryRouter><Page /></MemoryRouter>);
    paste(PNG);
    const image = screen.getByAltText('The decoded image');
    expect(screen.queryByRole('button', { name: /Download/ })).toBeNull();
    Object.defineProperty(image, 'naturalWidth', { value: 1 });
    Object.defineProperty(image, 'naturalHeight', { value: 1 });
    fireEvent.load(image);
    expect(screen.getByRole('button', { name: /Download image/ })).toBeInTheDocument();
  });

  it('reports data the browser cannot open', () => {
    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();
    render(<MemoryRouter><Page /></MemoryRouter>);
    paste(PNG);
    fireEvent.error(screen.getByAltText('The decoded image'));
    expect(screen.getByText(/it is damaged/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Download/ })).toBeNull();
  });
});
