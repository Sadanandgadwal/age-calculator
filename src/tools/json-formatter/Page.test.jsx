import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const type = (value) => fireEvent.change(screen.getByLabelText('Your JSON'), { target: { value } });

describe('JSON Formatter page', () => {
  it('formats live and shows errors', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    type('{"a":1}');
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('{\n  "a": 1\n}');
    fireEvent.click(screen.getByRole('button', { name: '4 spaces' }));
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('{\n    "a": 1\n}');
    type('{');
    expect(screen.getByText(/not valid JSON/)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Output' })).toBeNull();
  });
});
