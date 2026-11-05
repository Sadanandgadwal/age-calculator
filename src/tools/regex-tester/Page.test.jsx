import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { runRegex } from './logic.js';
import Page from './Page.jsx';

beforeEach(() => {
  vi.stubGlobal('Worker', class {
    terminate() {}

    postMessage(request) {
      setTimeout(() => this.onmessage({ data: runRegex(request) }));
    }
  });
});

afterEach(() => vi.unstubAllGlobals());

function setup(pattern, text) {
  render(<MemoryRouter><Page /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Pattern'), { target: { value: pattern } });
  fireEvent.change(screen.getByLabelText('Test text'), { target: { value: text } });
}

describe('Regex Tester page', () => {
  it('highlights matches and lists groups', async () => {
    setup('(\\d)x', 'a1x b2x');
    const marks = await screen.findAllByText(/^\dx$/, { selector: 'mark' });
    expect(marks.map((mark) => mark.textContent)).toEqual(['1x', '2x']);
    expect(screen.getByText('Matches', { selector: 'span' }).parentElement).toHaveTextContent('2');
    expect(screen.getByRole('region', { name: 'Match list' })).toHaveTextContent('1: 1');
  });

  it('shows user text only as text', async () => {
    setup('<b>', '<b>x</b><img src=x onerror=1>');
    expect(await screen.findByText('<b>', { selector: 'mark' })).toBeInTheDocument();
    expect(document.querySelector('[aria-label="Highlighted text"] img')).toBeNull();
  });

  it('explains an invalid pattern', async () => {
    setup('(', 'text');
    expect(await screen.findByText(/not a valid pattern/)).toBeInTheDocument();
  });
});
