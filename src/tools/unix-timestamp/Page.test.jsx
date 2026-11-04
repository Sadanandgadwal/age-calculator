import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  );
  return user;
}

const set = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const press = (user, name) => user.click(screen.getByRole('button', { name }));
const detail = (label) => screen.getByText(label, { selector: 'dt' }).parentElement;

describe('Unix Timestamp Converter', () => {
  it('converts a timestamp to a date', async () => {
    const user = setup();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    set('Unix timestamp', '1700000000');
    await press(user, 'Calculate');

    expect(detail('UTC Time')).toHaveTextContent('Tue, 14 Nov 2023 22:13:20 GMT');
    expect(detail('ISO 8601')).toHaveTextContent('2023-11-14T22:13:20.000Z');
    expect(detail('Unix Milliseconds')).toHaveTextContent('1700000000000');
    expect(detail('Local Time').textContent.length).toBeGreaterThan(15);
    expect(screen.getByRole('heading', { name: 'Converted Time' })).toHaveFocus();
  });

  it('supports milliseconds', async () => {
    const user = setup();
    await press(user, 'Milliseconds');
    set('Unix timestamp', '1700000000123');
    await press(user, 'Calculate');
    expect(detail('ISO 8601')).toHaveTextContent('2023-11-14T22:13:20.123Z');
  });

  it('warns about the wrong unit', async () => {
    const user = setup();
    set('Unix timestamp', '1700000000000');
    await press(user, 'Calculate');
    expect(screen.getByText(/looks like milliseconds/)).toBeInTheDocument();
  });

  it('converts a date to a timestamp', async () => {
    const user = setup();
    await press(user, 'Date to timestamp');
    set('Date', '2023-11-14');
    set('Time (optional)', '22:13:20');
    await press(user, 'UTC');
    await press(user, 'Calculate');

    expect(detail('Unix Seconds')).toHaveTextContent('1700000000');
    expect(screen.getByText('Seconds', { selector: 'span' }).parentElement).toHaveTextContent('1700000000');
  });

  it('fills in the current time', async () => {
    const user = setup();
    await press(user, 'Use current time');
    expect(screen.getByLabelText('Unix timestamp').value).toMatch(/^\d{10}$/);

    await press(user, 'Date to timestamp');
    await press(user, 'Use current time');
    expect(screen.getByLabelText('Date').value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(screen.getByLabelText('Time (optional)').value).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('shows errors and focuses the field', async () => {
    const user = setup();
    await press(user, 'Calculate');
    expect(screen.getByText('Please enter a timestamp.')).toBeInTheDocument();
    expect(screen.getByLabelText('Unix timestamp')).toHaveFocus();

    set('Unix timestamp', '12.5');
    expect(screen.getByText(/whole number/)).toBeInTheDocument();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('clears results when the direction changes', async () => {
    const user = setup();
    set('Unix timestamp', '1700000000');
    await press(user, 'Calculate');
    await press(user, 'Date to timestamp');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('copies and resets', async () => {
    const user = setup();
    set('Unix timestamp', '1700000000');
    await press(user, 'Calculate');
    await press(user, 'Copy results');
    expect(await navigator.clipboard.readText()).toContain('UTC: Tue, 14 Nov 2023 22:13:20 GMT');

    await press(user, 'Reset');
    expect(screen.getByLabelText('Unix timestamp')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Unix Timestamp Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
