import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PageSelector from './PageSelector.jsx';

function Harness() {
  const [selected, setSelected] = useState(new Set([0]));
  return (
    <>
      <PageSelector id="pages" label="Pages to keep" pageCount={5} images={[]} selected={selected} onChange={setSelected} />
      <output data-testid="chosen">{[...selected].join(',')}</output>
    </>
  );
}

describe('PageSelector', () => {
  it('shows the starting selection as ranges', () => {
    render(<Harness />);
    expect(screen.getByLabelText('Pages to keep')).toHaveValue('1');
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the field and the pages in step', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(screen.getByLabelText('Pages to keep')).toHaveValue('1-3');
    fireEvent.change(screen.getByLabelText('Pages to keep'), { target: { value: '4-5' } });
    expect(screen.getByTestId('chosen')).toHaveTextContent('3,4');
    expect(screen.getByRole('button', { name: 'Page 4' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows an error and keeps the last good selection', () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText('Pages to keep'), { target: { value: '9' } });
    expect(screen.getByText(/Page 9 does not exist/)).toBeInTheDocument();
    expect(screen.getByTestId('chosen')).toHaveTextContent('0');
  });

  it('selects all and none', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Select all' }));
    expect(screen.getByLabelText('Pages to keep')).toHaveValue('1-5');
    fireEvent.click(screen.getByRole('button', { name: 'Select none' }));
    expect(screen.getByTestId('chosen')).toBeEmptyDOMElement();
  });
});
