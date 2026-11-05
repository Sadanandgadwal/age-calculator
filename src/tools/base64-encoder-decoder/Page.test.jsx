import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Base64 page', () => {
  it('encodes, then decodes with a clear error', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Text to encode'), { target: { value: 'Hello' } });
    expect(screen.getByRole('region', { name: 'Output' })).toHaveTextContent('SGVsbG8=');
    fireEvent.click(screen.getByRole('button', { name: 'Decode' }));
    fireEvent.change(screen.getByLabelText('Base64 to decode'), { target: { value: '***' } });
    expect(screen.getByText('This is not valid Base64.')).toBeInTheDocument();
  });
});
