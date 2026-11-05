import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

beforeEach(() => {
  vi.stubGlobal('Worker', class {
    terminate() {}

    postMessage({ code }) {
      setTimeout(() => this.onmessage({ data: code.includes('bad') ? { error: 'Line 1, column 1: Unexpected token' } : { output: 'a()' } }));
    }
  });
});

afterEach(() => vi.unstubAllGlobals());

const minify = (user) => user.click(screen.getByRole('button', { name: /Minify|Working/ }));

describe('JavaScript Minifier page', () => {
  it('requires code', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    await minify(user);
    expect(screen.getByText('Please enter your JavaScript.')).toBeInTheDocument();
  });

  it('shows the result from the worker', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your JavaScript'), { target: { value: 'a();   ' } });
    await minify(user);
    expect((await screen.findByRole('region', { name: 'Output' })).textContent).toBe('a()');
    expect(screen.getByText('Saved', { selector: 'span' }).parentElement).toHaveTextContent('57.1%');
  });

  it('shows syntax errors', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your JavaScript'), { target: { value: 'bad' } });
    await minify(user);
    expect(await screen.findByText(/Unexpected token/)).toBeInTheDocument();
  });
});
