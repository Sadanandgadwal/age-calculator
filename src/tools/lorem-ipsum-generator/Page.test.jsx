import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Lorem Ipsum Generator page', () => {
  it('shows text straight away and follows the settings', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByRole('region', { name: 'Output' }).textContent.startsWith('Lorem ipsum')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Words' }));
    fireEvent.change(screen.getByLabelText('How many'), { target: { value: '12' } });
    expect(screen.getByText('Words', { selector: 'span' }).parentElement).toHaveTextContent('12');
    fireEvent.change(screen.getByLabelText('How many'), { target: { value: '0' } });
    expect(screen.getByText('Please enter 1 to 5,000.')).toBeInTheDocument();
  });
});
