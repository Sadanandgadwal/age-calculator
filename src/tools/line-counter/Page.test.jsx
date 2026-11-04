import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;

describe('Line Counter page', () => {
  it('counts lines live', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your text'), { target: { value: 'a\n\nb\nc' } });
    expect(card('Total Lines')).toHaveTextContent('4');
    expect(card('Blank Lines')).toHaveTextContent('1');
  });
});
