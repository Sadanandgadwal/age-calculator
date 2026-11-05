import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import FileDropZone from './FileDropZone.jsx';

const file = new File(['x'], 'a.png', { type: 'image/png' });

describe('FileDropZone', () => {
  it('accepts a chosen file', () => {
    const onFile = vi.fn();
    render(<FileDropZone id="f" label="Choose" onFile={onFile} />);
    fireEvent.change(screen.getByLabelText('Choose'), { target: { files: [file] } });
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('accepts a dropped file', () => {
    const onFile = vi.fn();
    render(<FileDropZone id="f" label="Choose" onFile={onFile} />);
    fireEvent.drop(screen.getByText('Choose'), { dataTransfer: { files: [file] } });
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('ignores an empty choice, and shows errors', () => {
    const onFile = vi.fn();
    render(<FileDropZone id="f" label="Choose" onFile={onFile} error="Too large" />);
    fireEvent.change(screen.getByLabelText('Choose'), { target: { files: [] } });
    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByText('Too large')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose')).toHaveAttribute('aria-invalid', 'true');
  });
});
