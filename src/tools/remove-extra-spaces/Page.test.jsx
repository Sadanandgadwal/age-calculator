import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Remove Extra Spaces page', () => {
  it('cleans live and follows the options', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your text'), { target: { value: 'a  b\n\nc' } });
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('a b\n\nc');
    fireEvent.click(screen.getByLabelText('Remove all blank lines'));
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('a b\nc');
  });
});
