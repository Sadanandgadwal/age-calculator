import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiQXNoYSIsImV4cCI6MX0.c2ln';

describe('JWT Decoder page', () => {
  it('decodes, says it is not verified, and offers Copy only', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your token'), { target: { value: TOKEN } });
    expect(screen.getByRole('note')).toHaveTextContent('has not been verified');
    expect(screen.getByRole('region', { name: 'Payload' })).toHaveTextContent('"name": "Asha"');
    expect(screen.getByText('Time Status', { selector: 'span' }).parentElement).toHaveTextContent('Expired');
    expect(screen.getByRole('button', { name: /Copy results/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Share/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Print/ })).toBeNull();
  });

  it('explains a bad token', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your token'), { target: { value: 'nope' } });
    expect(screen.getByText(/three parts/)).toBeInTheDocument();
  });
});
