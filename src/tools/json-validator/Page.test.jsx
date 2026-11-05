import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const type = (value) => fireEvent.change(screen.getByLabelText('Your JSON'), { target: { value } });

describe('JSON Validator page', () => {
  it('shows valid and invalid results live', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    type('{"a":1}');
    expect(screen.getByText('Valid JSON')).toBeInTheDocument();
    type('{"a":}');
    expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy results/ })).toBeInTheDocument();
  });
});
