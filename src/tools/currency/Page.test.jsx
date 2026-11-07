import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';
import { clearRateCache } from './logic.js';

const reply = (rate) => ({ ok: true, json: async () => [{ date: '2026-11-06', quote: 'USD', rate }] });
let fetchMock;

beforeEach(() => {
  clearRateCache();
  fetchMock = vi.fn().mockResolvedValue(reply(0.0125));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  );
  return user;
}

const amount = (value) => fireEvent.change(screen.getByLabelText('Amount'), { target: { value } });

describe('Currency Converter', () => {
  it('does not contact the rate service until an amount is entered', () => {
    setup();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('converts with the latest rate', async () => {
    setup();
    amount('1000');
    expect(await screen.findByText('INR 1,000.00 = USD 12.50')).toBeInTheDocument();
    expect(screen.getByText('Rate date').parentElement).toHaveTextContent('6 November 2026');
    expect(fetchMock).toHaveBeenCalledWith('https://api.frankfurter.dev/v2/rates?base=INR&quotes=USD', expect.anything());
  });

  it('offers a retry and your own rate when loading fails', async () => {
    fetchMock.mockReset();
    fetchMock.mockRejectedValueOnce(new TypeError('offline')).mockResolvedValue(reply(0.0125));
    const user = setup();
    amount('1000');
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('INR 1,000.00 = USD 12.50')).toBeInTheDocument();
  });

  it('uses your own rate without loading one', async () => {
    const user = setup();
    fireEvent.change(screen.getByLabelText(/Your own rate/), { target: { value: '0.011' } });
    amount('1000');
    expect(screen.getByText('INR 1,000.00 = USD 11.00')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Copy results' }));
    expect(await navigator.clipboard.readText()).toContain('Rate source: Rate you entered');
  });

  it('swaps and resets', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Swap currencies' }));
    expect(screen.getByLabelText('From')).toHaveValue('USD');
    amount('5');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('From')).toHaveValue('INR');
    expect(screen.getByLabelText('Amount')).toHaveValue('');
  });

  it('has the required sections', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Currency Converter' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
