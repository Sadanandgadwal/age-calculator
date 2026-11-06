import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import FileList from './FileList.jsx';
import { moveItem } from '../../utils/moveItem.js';

const items = [
  { id: 1, name: 'a.pdf', detail: '2 pages' },
  { id: 2, name: 'b.pdf', error: 'Could not be read' },
];

describe('FileList', () => {
  it('lists files with details and errors', () => {
    render(<FileList label="Files" items={items} onMove={() => {}} onRemove={() => {}} />);
    expect(screen.getByRole('list', { name: 'Files' })).toBeInTheDocument();
    expect(screen.getByText('2 pages')).toBeInTheDocument();
    expect(screen.getByText('Could not be read')).toBeInTheDocument();
  });

  it('disables moves past the ends', () => {
    render(<FileList label="Files" items={items} onMove={() => {}} onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: 'Move a.pdf up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move b.pdf down' })).toBeDisabled();
  });

  it('reports moves and removals', () => {
    const onMove = vi.fn();
    const onRemove = vi.fn();
    render(<FileList label="Files" items={items} onMove={onMove} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move a.pdf down' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove b.pdf' }));
    expect(onMove).toHaveBeenCalledWith(0, 1);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('can leave out the move buttons', () => {
    render(<FileList label="Files" items={items} onRemove={() => {}} />);
    expect(screen.queryByRole('button', { name: /Move/ })).toBeNull();
  });
});

describe('moveItem', () => {
  it('swaps neighbours', () => expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']));
  it('ignores moves past the ends', () => {
    const list = ['a', 'b'];
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(moveItem(list, 1, 1)).toBe(list);
  });
});
