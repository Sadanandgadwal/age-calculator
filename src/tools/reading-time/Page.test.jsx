import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;

describe('Reading Time page', () => {
  it('updates with the text and speed, and clears back to defaults', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your text'), { target: { value: 'word '.repeat(300) } });
    fireEvent.change(screen.getByLabelText('Reading speed (words a minute)'), { target: { value: '100' } });
    expect(card('Reading Time')).toHaveTextContent('3 min');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Reading speed (words a minute)')).toHaveValue('238');
  });
});
