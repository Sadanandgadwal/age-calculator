import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const pick = (user) => user.click(screen.getByRole('button', { name: /Pick$/ }));

describe('Random Name Picker page', () => {
  it('picks a winner from the list', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Names, one on each line'), { target: { value: 'Asha' } });
    await pick(user);
    expect(screen.getByText('Winner', { selector: 'span' }).parentElement).toHaveTextContent('Asha');
  });

  it('validates', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    await pick(user);
    expect(screen.getByText('Please enter at least one name.')).toBeInTheDocument();
  });
});
