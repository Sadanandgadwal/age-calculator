import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const generate = (user) => user.click(screen.getByRole('button', { name: /Generate/ }));

describe('Random Number Generator page', () => {
  it('picks a number in range only when asked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Lowest number'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Highest number'), { target: { value: '5' } });
    await generate(user);
    expect(screen.getByText('Random Number', { selector: 'span' }).parentElement).toHaveTextContent('5');
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Lowest number'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Highest number'), { target: { value: '5' } });
    await generate(user);
    expect(screen.getByText('The highest number must not be below the lowest.')).toBeInTheDocument();
  });
});
