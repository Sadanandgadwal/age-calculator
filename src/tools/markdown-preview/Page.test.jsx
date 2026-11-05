import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Markdown Previewer page', () => {
  it('previews live and removes scripts', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your Markdown'), { target: { value: '# Hello\n\n<script>window.__x=1</script>' } });
    const preview = screen.getByRole('region', { name: 'Markdown preview' });
    expect(within(preview).getByRole('heading', { name: 'Hello' })).toBeInTheDocument();
    expect(preview.querySelector('script')).toBeNull();
    expect(window.__x).toBeUndefined();
  });

  it('explains blocked images', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your Markdown'), { target: { value: '![a](https://x.example/a.png)' } });
    expect(screen.getByText(/1 remote image was not loaded/)).toBeInTheDocument();
  });
});
