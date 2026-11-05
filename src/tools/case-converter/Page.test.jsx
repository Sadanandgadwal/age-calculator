import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

describe('Case Converter page', () => {
  it('converts live and follows the chosen case', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Your text'), { target: { value: 'hello world' } });
    expect(screen.getByRole('region', { name: 'Output' })).toHaveTextContent('HELLO WORLD');
    fireEvent.click(screen.getByRole('button', { name: 'kebab-case' }));
    expect(screen.getByRole('region', { name: 'Output' })).toHaveTextContent('hello-world');
  });
});
