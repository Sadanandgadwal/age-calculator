import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToolSearch from './ToolSearch.jsx';

function Harness() {
  const [value, setValue] = useState('');
  return <ToolSearch value={value} onChange={setValue} />;
}

const input = () => screen.getByRole('textbox', { name: /search tools/i });

describe('ToolSearch', () => {
  it('only offers to clear when there is text', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();

    await user.type(input(), 'gst');
    expect(input()).toHaveValue('gst');

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input()).toHaveValue('');
  });

  it('does not reload the page when Enter is pressed', () => {
    const onChange = vi.fn();
    render(<ToolSearch value="gst" onChange={onChange} />);
    const notPrevented = fireEvent.submit(screen.getByRole('search'));
    expect(notPrevented).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });
});
