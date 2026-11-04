import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;

describe('Remove Duplicate Lines page', () => {
  it('removes repeats and follows the options', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your list'), { target: { value: 'a\nA\na' } });
    expect(card('Lines Removed')).toHaveTextContent('1');
    fireEvent.click(screen.getByLabelText('Ignore capital letters'));
    expect(card('Lines Removed')).toHaveTextContent('2');
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('a');
  });
});
