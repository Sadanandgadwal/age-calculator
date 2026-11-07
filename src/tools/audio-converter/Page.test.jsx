import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const setup = () => render(<MemoryRouter><Page /></MemoryRouter>);

describe('Audio Converter page', () => {
  it('cannot convert before audio is chosen', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Convert to WAV' })).toBeDisabled();
  });

  it('rejects a file that is not audio', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Choose or drop an audio file/), { target: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] } });
    expect(await screen.findByText('Please choose an audio file, such as MP3, M4A, OGG or WAV.')).toBeInTheDocument();
  });

  it('explains when the browser cannot read audio', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Choose or drop an audio file/), { target: { files: [new File(['x'], 'a.mp3', { type: 'audio/mpeg' })] } });
    expect(await screen.findByText('This browser cannot convert audio.')).toBeInTheDocument();
  });
});
