import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;

describe('Character Counter page', () => {
  it('counts live and checks the limit', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your text'), { target: { value: 'Hello world' } });
    expect(card('Characters')).toHaveTextContent('11');
    expect(card('Without Spaces')).toHaveTextContent('10');
    fireEvent.change(screen.getByLabelText('Character limit (optional)'), { target: { value: '5' } });
    expect(screen.getByText('6 over the limit of 5')).toBeInTheDocument();
  });
});
