import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

const MINUTE = 60000;

function setup() {
  render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  );
}

const press = (name) => fireEvent.click(screen.getByRole('button', { name }));
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const set = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const timerText = () => screen.getByRole('timer').textContent;
const card = (label) => screen.getByText(label).parentElement;
const isSelected = (name) => screen.getByRole('button', { name }).getAttribute('aria-pressed') === 'true';

function completeFocus(minutes = 25) {
  press('Start');
  advance(minutes * MINUTE + 1000);
}

describe('Pomodoro Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts on a 25 minute focus session, with the default lengths', () => {
    setup();
    expect(timerText()).toBe('25:00');
    expect(screen.getByRole('timer')).toHaveAccessibleName('Focus session');
    expect(isSelected('Focus')).toBe(true);
    expect(screen.getByLabelText('Short break (minutes)')).toHaveValue('5');
    expect(screen.getByLabelText('Long break (minutes)')).toHaveValue('15');
    expect(card('Focus Sessions Completed')).toHaveTextContent('0');
  });

  it('counts down, pauses and resumes', () => {
    setup();
    press('Start');
    advance(MINUTE);
    expect(timerText()).toBe('24:00');

    press('Pause');
    advance(5 * MINUTE);
    expect(timerText()).toBe('24:00');

    press('Resume');
    advance(MINUTE);
    expect(timerText()).toBe('23:00');
  });

  it('resets the current session without clearing the count', () => {
    setup();
    completeFocus();
    press('Focus');
    press('Start');
    advance(MINUTE);
    press('Reset');

    expect(timerText()).toBe('25:00');
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(card('Focus Sessions Completed')).toHaveTextContent('1');
  });

  it('counts a finished focus session and moves to a short break, without starting it', () => {
    setup();
    completeFocus();

    expect(card('Focus Sessions Completed')).toHaveTextContent('1');
    expect(card('Sessions Until Long Break')).toHaveTextContent('3');
    expect(isSelected('Short break')).toBe(true);
    expect(timerText()).toBe('05:00');
    expect(screen.getByRole('status')).toHaveTextContent('Focus session complete. Next: short break.');
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();

    advance(MINUTE);
    expect(timerText()).toBe('05:00');
  });

  it('returns to focus after a break, without counting the break', () => {
    setup();
    completeFocus();
    press('Start');
    advance(5 * MINUTE + 1000);

    expect(isSelected('Focus')).toBe(true);
    expect(card('Focus Sessions Completed')).toHaveTextContent('1');
    expect(screen.getByRole('status')).toHaveTextContent('Break over.');
  });

  it('moves to a long break after four focus sessions', () => {
    setup();
    for (let round = 0; round < 3; round += 1) {
      completeFocus();
      press('Start');
      advance(5 * MINUTE + 1000);
    }
    completeFocus();

    expect(card('Focus Sessions Completed')).toHaveTextContent('4');
    expect(isSelected('Long break')).toBe(true);
    expect(timerText()).toBe('15:00');
  });

  it('uses custom lengths', () => {
    setup();
    set('Focus (minutes)', '1');
    expect(timerText()).toBe('01:00');
    completeFocus(1);
    expect(card('Focus Sessions Completed')).toHaveTextContent('1');
  });

  it('applies a new length only to the next start of a running session', () => {
    setup();
    press('Start');
    advance(MINUTE);
    set('Focus (minutes)', '50');
    expect(timerText()).toBe('24:00');
  });

  it('blocks Start while the current length is invalid', () => {
    setup();
    set('Focus (minutes)', '0');
    expect(screen.getByText('Please enter 1 to 180 minutes.')).toBeInTheDocument();
    expect(timerText()).toBe('--:--');
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
  });

  it('switching session stops the timer without counting it', () => {
    setup();
    press('Start');
    advance(MINUTE);
    press('Long break');

    expect(timerText()).toBe('15:00');
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(card('Focus Sessions Completed')).toHaveTextContent('0');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears the completed count', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Clear completed sessions' })).toBeDisabled();
    completeFocus();
    press('Clear completed sessions');
    expect(card('Focus Sessions Completed')).toHaveTextContent('0');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Pomodoro Timer' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
