import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('CSS Minifier page', () => {
  it('minifies live and warns about mistakes', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your CSS'), { target: { value: 'a { color: red }' } });
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('a{color:red}');
    fireEvent.change(screen.getByLabelText('Your CSS'), { target: { value: 'a { color red }' } });
    expect(screen.getByText(/may be missing from the result/)).toBeInTheDocument();
  });
});
