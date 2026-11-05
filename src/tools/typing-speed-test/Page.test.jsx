import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { PASSAGES } from './logic.js';
import Page from './Page.jsx';

const input = () => screen.getByLabelText(/Type here/);

describe('Typing Speed Test page', () => {
  it('waits for the first key, then scores a finished passage', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByRole('timer')).toHaveTextContent('60 s');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    fireEvent.change(input(), { target: { value: PASSAGES[0] } });
    expect(screen.getByRole('timer')).toHaveTextContent('Finished');
    expect(screen.getByText('Accuracy', { selector: 'span' }).parentElement).toHaveTextContent('100%');
    expect(input()).toBeDisabled();
  });

  it('can restart', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(input(), { target: { value: PASSAGES[0] } });
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    expect(input()).toHaveValue('');
    expect(input()).toBeEnabled();
    expect(screen.getByRole('timer')).toHaveTextContent('60 s');
  });

  it('changes the text', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    const first = screen.getByRole('region', { name: 'Text to type' }).textContent;
    fireEvent.click(screen.getByRole('button', { name: 'New text' }));
    expect(screen.getByRole('region', { name: 'Text to type' }).textContent).not.toBe(first);
  });

  it('blocks pasting', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(fireEvent.paste(input())).toBe(false);
  });
});
