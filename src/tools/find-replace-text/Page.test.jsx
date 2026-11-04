import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { replaceText } from './logic.js';
import Page from './Page.jsx';

function setup({ text = 'one two one', find = 'one', replacement = 'x' } = {}) {
  const user = userEvent.setup();
  render(<MemoryRouter><Page /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Your text'), { target: { value: text } });
  fireEvent.change(screen.getByLabelText('Find'), { target: { value: find } });
  fireEvent.change(screen.getByLabelText('Replace with'), { target: { value: replacement } });
  return user;
}

const submit = (user) => user.click(screen.getByRole('button', { name: /Replace all/ }));

afterEach(() => vi.unstubAllGlobals());

describe('Find and Replace page', () => {
  it('replaces plain text', async () => {
    const user = setup();
    await submit(user);
    expect(screen.getByRole('region', { name: 'Output' }).textContent).toBe('x two x');
    expect(screen.getByText('Replacements Made', { selector: 'span' }).parentElement).toHaveTextContent('2');
  });

  it('requires a search', async () => {
    const user = setup({ find: '' });
    await submit(user);
    expect(screen.getByText('Please enter what to find.')).toBeInTheDocument();
  });

  it('runs regular expressions in a worker', async () => {
    vi.stubGlobal('Worker', class {
      terminate() {}

      postMessage(request) {
        setTimeout(() => this.onmessage({ data: replaceText(request) }));
      }
    });
    const user = setup({ text: 'a1 b2', find: '\\d', replacement: '#' });
    await user.click(screen.getByLabelText('Use a regular expression'));
    await submit(user);
    expect(await screen.findByRole('region', { name: 'Output' })).toHaveTextContent('a# b#');
  });
});
