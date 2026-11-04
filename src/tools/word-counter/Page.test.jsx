import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;
const type = (value) => fireEvent.change(screen.getByLabelText('Your text'), { target: { value } });

describe('Word Counter page', () => {
  it('counts live and clears', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    type('One two three. Four.');
    expect(card('Words')).toHaveTextContent('4');
    expect(card('Sentences')).toHaveTextContent('2');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });
});
