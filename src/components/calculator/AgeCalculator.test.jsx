import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgeCalculator from './AgeCalculator.jsx';
import { MESSAGES } from '../../utils/validation.js';

const dobInput = () => screen.getByLabelText('Date of Birth');
const asOfInput = () => screen.getByLabelText('Calculate Age As Of');
const setDate = (input, value) => fireEvent.change(input, { target: { value } });

function setup() {
  const user = userEvent.setup();
  render(<AgeCalculator />);
  return { user, submit: () => user.click(screen.getByRole('button', { name: 'Calculate Age' })) };
}

/** Reads a stat card or detail row by finding the element that holds its label. */
const detailValue = (label) => screen.getByText(label).parentElement.querySelector('dd').textContent;

describe('AgeCalculator', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 3, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts with an empty birth date, today as the calculation date, and no result', () => {
      setup();
      expect(dobInput()).toHaveValue('');
      expect(asOfInput()).toHaveValue('2026-11-03');
      expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    });
  });

  describe('calculating', () => {
    it('shows every result for a normal date of birth', async () => {
      const { submit } = setup();
      setDate(dobInput(), '1998-06-15');
      await submit();

      const results = within(screen.getByRole('region', { name: 'Your results' }));
      expect(results.getByText('28')).toBeInTheDocument();
      expect(results.getByText('Years')).toBeInTheDocument();
      expect(results.getByText('4')).toBeInTheDocument();
      expect(results.getByText('19')).toBeInTheDocument();
      expect(results.getByText('Born 15 Jun 1998 · As of 3 Nov 2026')).toBeInTheDocument();

      expect(detailValue('Total Days Lived')).toBe('10,368 days');
      expect(detailValue('Total Months Lived')).toBe('340 months');
      expect(detailValue('Total Weeks Lived')).toBe('1,481 weeks');
      expect(detailValue('Day of Birth')).toBe('Monday');
      expect(detailValue('Next Birthday In')).toBe('224 days');
      expect(detailValue('Next Birthday On')).toBe('15 Jun 2027');
    });

    it('uses singular labels for a value of one', async () => {
      const { submit } = setup();
      setDate(dobInput(), '2025-10-02');
      await submit();

      expect(screen.getByText('Year')).toBeInTheDocument();
      expect(screen.getByText('Month')).toBeInTheDocument();
      expect(screen.getByText('Day')).toBeInTheDocument();
    });

    it('calculates age on a chosen date', async () => {
      const { submit } = setup();
      setDate(dobInput(), '2000-01-01');
      setDate(asOfInput(), '2050-07-01');
      await submit();

      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('handles a birth date of today', async () => {
      const { submit } = setup();
      setDate(dobInput(), '2026-11-03');
      await submit();

      expect(detailValue('Total Days Lived')).toBe('0 days');
      expect(detailValue('Next Birthday On')).toBe('3 Nov 2027');
      expect(screen.queryByText(/Happy birthday/)).not.toBeInTheDocument();
    });

    it('celebrates a birthday on the calculation date', async () => {
      const { submit } = setup();
      setDate(dobInput(), '2000-11-03');
      await submit();

      expect(screen.getByText(/Happy birthday! You turn 26/)).toBeInTheDocument();
      expect(detailValue('Next Birthday In')).toBe('Today!');
    });

    it('explains the observed date for a 29 February birthday', async () => {
      const { submit } = setup();
      setDate(dobInput(), '2000-02-29');
      await submit();

      expect(detailValue('Next Birthday On')).toBe('28 Feb 2027');
      expect(screen.getByText(/2027 isn't a leap year/)).toBeInTheDocument();
    });

    it('moves focus to the results heading', async () => {
      const { submit } = setup();
      setDate(dobInput(), '1998-06-15');
      await submit();

      expect(screen.getByRole('heading', { name: 'Your Exact Age' })).toHaveFocus();
    });

    it('flags results as out of date after a date changes, then clears the flag on recalculating', async () => {
      const { submit } = setup();
      setDate(dobInput(), '1998-06-15');
      await submit();
      expect(screen.queryByText(/You changed the dates/)).not.toBeInTheDocument();

      setDate(dobInput(), '1999-06-15');
      expect(screen.getByText(/You changed the dates/)).toBeInTheDocument();
      expect(screen.getByText('Born 15 Jun 1998 · As of 3 Nov 2026')).toBeInTheDocument();

      await submit();
      expect(screen.queryByText(/You changed the dates/)).not.toBeInTheDocument();
      expect(screen.getByText('Born 15 Jun 1999 · As of 3 Nov 2026')).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('requires a date of birth and focuses the field', async () => {
      const { submit } = setup();
      await submit();

      expect(screen.getByText(MESSAGES.dobRequired)).toBeInTheDocument();
      expect(dobInput()).toHaveAttribute('aria-invalid', 'true');
      expect(dobInput()).toHaveAccessibleDescription(MESSAGES.dobRequired);
      expect(dobInput()).toHaveFocus();
      expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    });

    it('rejects a future date of birth', async () => {
      const { submit } = setup();
      setDate(dobInput(), '2026-11-04');
      await submit();

      expect(screen.getByText(MESSAGES.dobInFuture)).toBeInTheDocument();
      expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
    });

    it('rejects a calculation date earlier than the date of birth', async () => {
      const { submit } = setup();
      setDate(dobInput(), '2000-01-02');
      setDate(asOfInput(), '2000-01-01');
      await submit();

      expect(screen.getByText(MESSAGES.asOfBeforeDob)).toBeInTheDocument();
      expect(asOfInput()).toHaveFocus();
    });

    it('clears a field error as soon as that field is edited', async () => {
      const { submit } = setup();
      await submit();
      expect(screen.getByText(MESSAGES.dobRequired)).toBeInTheDocument();

      setDate(dobInput(), '1998-06-15');
      expect(screen.queryByText(MESSAGES.dobRequired)).not.toBeInTheDocument();
    });

    it('removes an earlier result when the new dates are invalid', async () => {
      const { submit } = setup();
      setDate(dobInput(), '1998-06-15');
      await submit();

      setDate(dobInput(), '2030-01-01');
      await submit();

      expect(screen.queryByText('Total Days Lived')).not.toBeInTheDocument();
    });
  });

  describe('reset', () => {
    it('clears inputs, results and errors, and restores today', async () => {
      const { user, submit } = setup();
      setDate(dobInput(), '1998-06-15');
      setDate(asOfInput(), '2020-01-01');
      await submit();
      expect(screen.getByText('Total Days Lived')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Reset' }));

      expect(dobInput()).toHaveValue('');
      expect(asOfInput()).toHaveValue('2026-11-03');
      expect(screen.queryByText('Total Days Lived')).not.toBeInTheDocument();
      expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
      expect(dobInput()).toHaveFocus();
    });

    it('clears validation errors', async () => {
      const { user, submit } = setup();
      await submit();
      await user.click(screen.getByRole('button', { name: 'Reset' }));

      expect(screen.queryByText(MESSAGES.dobRequired)).not.toBeInTheDocument();
      expect(dobInput()).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('result actions', () => {
    async function calculated() {
      const context = setup();
      setDate(dobInput(), '1998-06-15');
      await context.submit();
      return context;
    }

    it('hides the actions until there is a result', () => {
      setup();
      expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();
    });

    it('copies the result and confirms it', async () => {
      const { user } = await calculated();
      await user.click(screen.getByRole('button', { name: 'Copy' }));

      const copied = await navigator.clipboard.readText();
      expect(copied).toContain('Age on 3 Nov 2026: 28 years, 4 months, 19 days');
      expect(copied).toContain('Born on: Monday, 15 Jun 1998');
      expect(copied).toContain('Next birthday: 15 Jun 2027 (224 days)');
      expect(screen.getByRole('status')).toHaveTextContent('Age copied to clipboard.');
    });

    it('reports a failed copy', async () => {
      const { user } = await calculated();
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));

      await user.click(screen.getByRole('button', { name: 'Copy' }));

      expect(screen.getByRole('status')).toHaveTextContent("Couldn't copy");
    });

    describe('share', () => {
      afterEach(() => {
        delete navigator.share;
      });

      it('uses the native share sheet when available', async () => {
        const { user } = await calculated();
        navigator.share = vi.fn().mockResolvedValue();

        await user.click(screen.getByRole('button', { name: 'Share' }));

        expect(navigator.share).toHaveBeenCalledOnce();
        expect(navigator.share.mock.calls[0][0].text).toContain('28 years, 4 months, 19 days');
      });

      it('stays quiet when the user closes the share sheet', async () => {
        const { user } = await calculated();
        navigator.share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));

        await user.click(screen.getByRole('button', { name: 'Share' }));

        expect(screen.getByRole('status')).toBeEmptyDOMElement();
      });

      it('falls back to copying when native sharing is unavailable', async () => {
        const { user } = await calculated();

        await user.click(screen.getByRole('button', { name: 'Share' }));

        expect(await navigator.clipboard.readText()).toContain('28 years, 4 months, 19 days');
        expect(screen.getByRole('status')).toHaveTextContent('copied instead');
      });
    });

    it('opens the print dialog', async () => {
      const { user } = await calculated();
      const print = vi.spyOn(window, 'print').mockImplementation(() => {});

      await user.click(screen.getByRole('button', { name: 'Print' }));

      expect(print).toHaveBeenCalledOnce();
    });
  });
});
