import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const NOW = new Date(2026, 10, 3, 12);

function setup() {
  render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  );
}

const set = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const press = (name) => fireEvent.click(screen.getByRole('button', { name }));
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const card = (label) => screen.getByText(label, { selector: 'span' }).parentElement;

describe('Countdown Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('requires a date', () => {
    setup();
    press('Start');
    expect(screen.getByText('Please choose a target date.')).toBeInTheDocument();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('counts down live, using the event name', () => {
    setup();
    set('Event name (optional)', 'Launch');
    set('Target date', '2026-11-04');
    set('Target time (optional)', '13:01');
    press('Start');

    expect(screen.getByRole('heading', { name: 'Time until Launch' })).toBeInTheDocument();
    expect(screen.getByText('Target: 4 Nov 2026')).toBeInTheDocument();
    expect(card('Days')).toHaveTextContent('1');
    expect(card('Hours')).toHaveTextContent('1');
    expect(card('Minutes')).toHaveTextContent('1');

    advance(61000);
    expect(card('Hours')).toHaveTextContent('0');
    expect(card('Minutes')).toHaveTextContent('59');
    expect(card('Seconds')).toHaveTextContent('59');
  });

  it('pauses and resumes from the time left', () => {
    setup();
    set('Target date', '2026-11-03');
    set('Target time (optional)', '12:10');
    press('Start');
    advance(60000);
    press('Pause');
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(card('Minutes')).toHaveTextContent('9');

    advance(300000);
    expect(card('Minutes')).toHaveTextContent('9');

    press('Resume');
    advance(60000);
    expect(card('Minutes')).toHaveTextContent('8');
  });

  it('stops at zero when the event is reached', () => {
    setup();
    set('Target date', '2026-11-03');
    set('Target time (optional)', '12:00:05');
    press('Start');
    advance(6000);

    expect(screen.getByText('Event reached!')).toBeInTheDocument();
    expect(card('Seconds')).toHaveTextContent('0');
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('can start again after the event is reached', () => {
    setup();
    set('Target date', '2026-11-03');
    set('Target time (optional)', '12:00:05');
    press('Start');
    advance(6000);

    set('Target date', '2026-11-04');
    press('Start');
    expect(card('Hours')).toHaveTextContent('23');
    expect(screen.queryByText('Event reached!')).not.toBeInTheDocument();
  });

  it('explains a date that has already passed', () => {
    setup();
    set('Target date', '2020-01-01');
    press('Start');
    expect(screen.getByText(/has already passed/)).toBeInTheDocument();
    expect(screen.queryByText('Days', { selector: 'span' })).not.toBeInTheDocument();
  });

  it('resets everything', () => {
    setup();
    set('Event name (optional)', 'Launch');
    set('Target date', '2026-11-04');
    press('Start');
    press('Reset');

    expect(screen.getByLabelText('Event name (optional)')).toHaveValue('');
    expect(screen.getByLabelText('Target date')).toHaveValue('');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Countdown Timer' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
