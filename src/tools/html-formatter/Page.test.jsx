import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('HTML Formatter page', () => {
  it('shows the result as text, not as elements', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your HTML'), { target: { value: '<div><img src=x></div>' } });
    const output = screen.getByRole('region', { name: 'Output' });
    expect(output.textContent).toContain('<img src=x>');
    expect(output.querySelector('img')).toBeNull();
  });
});
