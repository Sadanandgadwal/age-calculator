import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('URL tool page', () => {
  it('encodes live and explains broken input', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Text to encode'), { target: { value: 'a b' } });
    expect(screen.getByRole('region', { name: 'Output' })).toHaveTextContent('a%20b');
    fireEvent.click(screen.getByRole('button', { name: 'Decode' }));
    fireEvent.change(screen.getByLabelText('Text to decode'), { target: { value: '%' } });
    expect(screen.getByText(/broken percent code/)).toBeInTheDocument();
  });
});
