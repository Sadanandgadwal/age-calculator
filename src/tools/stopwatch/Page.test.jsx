import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

function setup() {
  render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  );
}

const press = (name) => fireEvent.click(screen.getByRole('button', { name }));
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const time = () => screen.getByRole('timer', { name: 'Elapsed time' }).textContent;

describe('Online Stopwatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at zero, with Lap unavailable', () => {
    setup();
    expect(time()).toBe('00:00:00.00');
    expect(screen.getByRole('button', { name: 'Lap' })).toBeDisabled();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('counts while running', () => {
    setup();
    press('Start');
    advance(1500);
    expect(time()).toBe('00:00:01.50');
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('pauses and resumes without losing time', () => {
    setup();
    press('Start');
    advance(1000);
    press('Pause');
    advance(5000);
    expect(time()).toBe('00:00:01.00');
    expect(screen.getByRole('button', { name: 'Lap' })).toBeDisabled();

    press('Resume');
    advance(500);
    expect(time()).toBe('00:00:01.50');
  });

  it('records laps with lap and total times', () => {
    setup();
    press('Start');
    advance(1000);
    press('Lap');
    advance(2000);
    press('Lap');

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent('200:00:02.0000:00:03.00');
    expect(rows[2]).toHaveTextContent('100:00:01.0000:00:01.00');
  });

  it('clears laps without stopping the time', () => {
    setup();
    press('Start');
    advance(1000);
    press('Lap');
    press('Clear laps');

    expect(screen.queryAllByRole('row')).toHaveLength(0);
    advance(1000);
    expect(time()).toBe('00:00:02.00');
  });

  it('resets the time and laps', () => {
    setup();
    press('Start');
    advance(1000);
    press('Lap');
    press('Reset');

    expect(time()).toBe('00:00:00.00');
    expect(screen.queryAllByRole('row')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Online Stopwatch' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
