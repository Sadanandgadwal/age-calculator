import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const setup = () => render(<MemoryRouter><Page /></MemoryRouter>);
const choose = (file) => fireEvent.change(screen.getByLabelText(/Choose or drop a Word document/), { target: { files: [file] } });

describe('Word to PDF page', () => {
  it('cannot convert before a document is chosen', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Convert to PDF' })).toBeDisabled();
  });

  it('explains that .doc files are not supported', async () => {
    setup();
    choose(new File(['x'], 'old.doc'));
    expect(await screen.findByText('Older .doc files are not supported. Open the file in Word and save it as .docx first.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Convert to PDF' })).toBeDisabled();
  });

  it('accepts a .docx file', async () => {
    setup();
    choose(new File(['PK'], 'report.docx'));
    expect(await screen.findByText('report.docx')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Convert to PDF' })).toBeEnabled();
  });
});
