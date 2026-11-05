import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const output = () => screen.getByRole('region', { name: 'Output' }).textContent;

describe('Text Sorter page', () => {
  it('sorts live, follows the order and shuffles', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Shuffle lines' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Your lines'), { target: { value: 'b\na\nc' } });
    expect(output()).toBe('a\nb\nc');
    fireEvent.click(screen.getByRole('button', { name: 'Z to A' }));
    expect(output()).toBe('c\nb\na');
    fireEvent.click(screen.getByRole('button', { name: 'Shuffle lines' }));
    expect(output().split('\n').sort()).toEqual(['a', 'b', 'c']);
    fireEvent.click(screen.getByRole('button', { name: 'A to Z' }));
    expect(output()).toBe('a\nb\nc');
  });
});
