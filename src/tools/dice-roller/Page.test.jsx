import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const roll = (user) => user.click(screen.getByRole('button', { name: /Roll$/ }));

describe('Dice Roller page', () => {
  it('rolls the chosen dice', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'd20' }));
    fireEvent.change(screen.getByLabelText('Number of dice'), { target: { value: '2' } });
    await roll(user);
    expect(screen.getByText('Dice', { selector: 'span' }).parentElement).toHaveTextContent('2d20');
    expect(screen.getByRole('region', { name: 'Every roll' }).textContent.split(', ')).toHaveLength(2);
  });

  it('validates', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Number of dice'), { target: { value: '101' } });
    await roll(user);
    expect(screen.getByText('Please enter 1 to 100 dice.')).toBeInTheDocument();
  });
});
