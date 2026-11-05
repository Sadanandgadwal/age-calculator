import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('HTML Entity page', () => {
  it('shows encoded text as text', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Text to encode'), { target: { value: '<b>' } });
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('&lt;b&gt;');
    fireEvent.click(screen.getByRole('button', { name: 'Decode' }));
    fireEvent.change(screen.getByLabelText('Text to decode'), { target: { value: '&lt;img src=x&gt;' } });
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('<img src=x>');
    expect(screen.getByRole('region', { name: 'Output' }).querySelector('img')).toBeNull();
  });
});
