import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const generate = (user) => user.click(screen.getByRole('button', { name: /Generate/ }));

describe('UUID Generator page', () => {
  it('creates UUIDs when asked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.queryByRole('region', { name: 'Output' })).toBeNull();
    fireEvent.change(screen.getByLabelText('How many'), { target: { value: '3' } });
    await generate(user);
    expect(screen.getByRole('region', { name: 'Output' }).textContent.split('\n')).toHaveLength(3);
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('How many'), { target: { value: '0' } });
    await generate(user);
    expect(screen.getByText('Please enter 1 to 1,000.')).toBeInTheDocument();
  });
});
