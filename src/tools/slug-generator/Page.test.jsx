import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const type = (value) => fireEvent.change(screen.getByLabelText('Title or text'), { target: { value } });

describe('Slug Generator page', () => {
  it('builds the slug live and explains when there is none', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    type('Hello Big World!');
    expect(screen.getByRole('region', { name: 'Output' })).toHaveTextContent('hello-big-world');
    fireEvent.click(screen.getByRole('button', { name: 'Underscore (_)' }));
    expect(screen.getByRole('region', { name: 'Output' })).toHaveTextContent('hello_big_world');
    type('!!!');
    expect(screen.getByText('This text has no letters or numbers to use in a slug.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Copy results/ })).toBeNull();
  });
});
