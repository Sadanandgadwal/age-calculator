import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('JSON Minifier page', () => {
  it('minifies live', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your JSON'), { target: { value: '{ "a" : 1 }' } });
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('{"a":1}');
    expect(screen.getByText('Saved', { selector: 'span' }).parentElement).toHaveTextContent('36.4%');
  });
});
