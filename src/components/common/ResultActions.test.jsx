import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultActions from './ResultActions.jsx';

function setup() {
  const user = userEvent.setup();
  render(<ResultActions getText={() => 'The result'} />);
  return user;
}

const press = (user, name) => user.click(screen.getByRole('button', { name }));

describe('ResultActions', () => {
  afterEach(() => {
    delete navigator.share;
  });

  it('offers copy, share and print', () => {
    setup();
    for (const name of ['Copy results', 'Share', 'Print']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('copies the results', async () => {
    const user = setup();
    await press(user, 'Copy results');
    expect(await navigator.clipboard.readText()).toBe('The result');
    expect(screen.getByRole('status')).toHaveTextContent('Results copied to clipboard.');
  });

  it('reports a failed copy', async () => {
    const user = setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    await press(user, 'Copy results');
    expect(screen.getByRole('status')).toHaveTextContent("Couldn't copy");
  });

  it('shares the results and the page link', async () => {
    const user = setup();
    navigator.share = vi.fn().mockResolvedValue();
    await press(user, 'Share');
    expect(navigator.share).toHaveBeenCalledWith({ title: document.title, text: 'The result', url: window.location.href });
  });

  it('stays quiet when the share sheet is closed', async () => {
    const user = setup();
    navigator.share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));
    await press(user, 'Share');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('reports a failed share', async () => {
    const user = setup();
    navigator.share = vi.fn().mockRejectedValue(new Error('failed'));
    await press(user, 'Share');
    expect(screen.getByRole('status')).toHaveTextContent("Couldn't share");
  });

  it('copies the results and link when sharing is unavailable', async () => {
    const user = setup();
    await press(user, 'Share');
    expect(await navigator.clipboard.readText()).toBe(`The result\n${window.location.href}`);
    expect(screen.getByRole('status')).toHaveTextContent('copied instead');
  });

  it('opens the print dialog', async () => {
    const user = setup();
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    await press(user, 'Print');
    expect(print).toHaveBeenCalledOnce();
  });
});

describe('every tool', () => {
  const pages = import.meta.glob('../../tools/*/Page.jsx', { query: '?raw', import: 'default', eager: true });
  const sources = import.meta.glob('../../tools/*/*.jsx', { query: '?raw', import: 'default', eager: true });

  it('finds the tool pages', () => {
    expect(Object.keys(pages).length).toBeGreaterThanOrEqual(27);
  });

  it.each(Object.keys(pages))('%s offers Copy results, Share and Print', (page) => {
    const folder = page.slice(0, page.lastIndexOf('/') + 1);
    const code = Object.entries(sources)
      .filter(([path]) => path.startsWith(folder) && !path.endsWith('.test.jsx'))
      .map(([, source]) => source)
      .join('\n');
    expect(/<ResultActions\b|<UnitConverter\b/.test(code)).toBe(true);
  });
});
