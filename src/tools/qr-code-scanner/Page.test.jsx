import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

afterEach(() => vi.unstubAllGlobals());

describe('QR Code Scanner page', () => {
  it('rejects files that are not images', async () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Choose or drop an image/), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText(/choose an image file/)).toBeInTheDocument();
  });

  it('does not touch the camera until asked, and explains a refusal', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(Object.assign(new Error('no'), { name: 'NotAllowedError' }));
    vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia } });
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(getUserMedia).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'With my camera' }));
    expect(getUserMedia).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Start camera' }));
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('alert')).toHaveTextContent('blocked');
  });

  it('explains when the camera is unavailable', async () => {
    vi.stubGlobal('navigator', { ...navigator, mediaDevices: undefined });
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'With my camera' }));
    await user.click(screen.getByRole('button', { name: 'Start camera' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('secure (https)');
  });
});
