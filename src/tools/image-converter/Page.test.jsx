import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const setup = () => render(<MemoryRouter><Page /></MemoryRouter>);
const add = (...files) => fireEvent.change(screen.getByLabelText(/Choose or drop images/), { target: { files } });

describe('Image Converter page', () => {
  it('cannot convert before images are chosen', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Convert images' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'AVIF' })).not.toBeInTheDocument();
  });

  it('lists chosen images and explains rejected files', async () => {
    setup();
    add(new File(['x'], 'a.png', { type: 'image/png' }), new File(['x'], 'notes.txt', { type: 'text/plain' }));
    expect(await screen.findByRole('list', { name: 'Images to convert' })).toHaveTextContent('a.png');
    expect(screen.getByText(/notes.txt: Please choose an image file/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove a.png' }));
    expect(screen.queryByRole('list', { name: 'Images to convert' })).not.toBeInTheDocument();
  });

  it('shows the quality slider only for lossy formats', () => {
    setup();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'PNG' }));
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });
});
