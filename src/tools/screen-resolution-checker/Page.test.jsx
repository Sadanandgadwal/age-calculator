import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Screen Resolution Checker page', () => {
  it('shows the window size and follows resizing', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    window.innerWidth = 777;
    fireEvent(window, new Event('resize'));
    expect(screen.getByText('Browser Window', { selector: 'span' }).parentElement).toHaveTextContent('777 ×');
    expect(screen.getByRole('button', { name: /Print/ })).toBeInTheDocument();
  });
});
