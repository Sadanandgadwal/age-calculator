import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Text Reverser page', () => {
  it('reverses live and follows the mode', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your text'), { target: { value: 'one two' } });
    expect(screen.getByRole('region', { name: 'Output' })).toHaveTextContent('owt eno');
    fireEvent.click(screen.getByRole('button', { name: 'Words' }));
    expect(screen.getByRole('region', { name: 'Output' })).toHaveTextContent('two one');
  });
});
