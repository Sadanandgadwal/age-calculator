import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const type = (value) => fireEvent.change(screen.getByLabelText('Value'), { target: { value } });

describe('Barcode Generator page', () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = () => ({ measureText: () => ({ width: 20 }) });
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it('draws live, with download buttons', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    type('SKU-1');
    expect(screen.getByRole('img', { name: 'Code 128 barcode for SKU-1' }).querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Download PNG' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download SVG' })).toBeInTheDocument();
  });

  it('explains an invalid value', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'EAN-13' }));
    type('123');
    expect(screen.getByText(/not a valid EAN-13 value/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Download PNG' })).toBeNull();
  });
});
