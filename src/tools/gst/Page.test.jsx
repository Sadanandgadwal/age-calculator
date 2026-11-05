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

const setAmount = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const calculate = (user) => user.click(screen.getByRole('button', { name: 'Calculate' }));
const detail = (label) => screen.getByText(label, { selector: 'dt' }).parentElement;

describe('GST Calculator', () => {
  it('starts with sensible defaults and no result', () => {
    setup();
    expect(screen.getByLabelText('GST rate')).toHaveValue('18');
    expect(screen.getByRole('button', { name: 'Add GST' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Intra-state' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('offers every rate, and groups the older ones', () => {
    setup();
    const groups = screen.getByLabelText('GST rate').querySelectorAll('optgroup');
    expect([...groups[0].querySelectorAll('option')].map((option) => option.value)).toEqual(['0', '0.25', '3', '5', '18', '40']);
    expect(groups[1]).toHaveAttribute('label', 'Older rates');
    expect([...groups[1].querySelectorAll('option')].map((option) => option.value)).toEqual(['12', '28']);
    expect(screen.getByRole('option', { name: 'Custom rate' })).toBeInTheDocument();
  });

  it('shows the full intra-state breakdown', async () => {
    const user = setup();
    setAmount('Amount before GST (₹)', '1000');
    await calculate(user);

    expect(detail('Original Amount')).toHaveTextContent('₹1,000.00');
    expect(detail('Taxable Amount')).toHaveTextContent('₹1,000.00');
    expect(detail('GST Percentage')).toHaveTextContent('18%');
    expect(detail('CGST (9%)')).toHaveTextContent('₹90.00');
    expect(detail('SGST (9%)')).toHaveTextContent('₹90.00');
    expect(detail('IGST (18%)')).toHaveTextContent('Not applicable');
    expect(detail('Total GST')).toHaveTextContent('₹180.00');
    expect(detail('Final Amount')).toHaveTextContent('₹1,180.00');
    expect(screen.getByRole('heading', { name: 'GST Breakdown' })).toHaveFocus();
  });

  it('shows IGST for inter-state', async () => {
    const user = setup();
    setAmount('Amount before GST (₹)', '1000');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Inter-state' }));

    expect(detail('IGST (18%)')).toHaveTextContent('₹180.00');
    expect(detail('CGST (9%)')).toHaveTextContent('Not applicable');
    expect(detail('Final Amount')).toHaveTextContent('₹1,180.00');
  });

  it('removes GST from an inclusive amount', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Remove GST' }));
    setAmount('Amount including GST (₹)', '1180');
    await calculate(user);

    expect(detail('Taxable Amount')).toHaveTextContent('₹1,000.00');
    expect(detail('Total GST')).toHaveTextContent('₹180.00');
    expect(detail('Final Amount')).toHaveTextContent('₹1,180.00');
  });

  it('uses a standard rate', async () => {
    const user = setup();
    setAmount('Amount before GST (₹)', '1000');
    await user.selectOptions(screen.getByLabelText('GST rate'), '5');
    await calculate(user);
    expect(detail('Total GST')).toHaveTextContent('₹50.00');
  });

  it('asks for and uses a custom rate', async () => {
    const user = setup();
    expect(screen.queryByLabelText('Custom GST rate')).not.toBeInTheDocument();

    setAmount('Amount before GST (₹)', '1000');
    await user.selectOptions(screen.getByLabelText('GST rate'), 'custom');
    await calculate(user);
    expect(screen.getByText('Please enter a GST rate.')).toBeInTheDocument();
    expect(screen.getByLabelText('Custom GST rate')).toHaveFocus();

    setAmount('Custom GST rate', '7.5');
    expect(detail('Total GST')).toHaveTextContent('₹75.00');
    expect(detail('CGST (3.75%)')).toHaveTextContent('₹37.50');
  });

  it('shows errors and focuses the amount', async () => {
    const user = setup();
    await calculate(user);

    expect(screen.getByText('Please enter an amount.')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount before GST (₹)')).toHaveFocus();

    setAmount('Amount before GST (₹)', '-5');
    expect(screen.getByText("The amount can't be negative.")).toBeInTheDocument();
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('resets everything', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Remove GST' }));
    await user.click(screen.getByRole('button', { name: 'Inter-state' }));
    await user.selectOptions(screen.getByLabelText('GST rate'), '5');
    setAmount('Amount including GST (₹)', '100');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByLabelText('Amount before GST (₹)')).toHaveValue('');
    expect(screen.getByLabelText('GST rate')).toHaveValue('18');
    expect(screen.getByRole('button', { name: 'Add GST' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Intra-state' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('copies the breakdown', async () => {
    const user = setup();
    setAmount('Amount before GST (₹)', '1000');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));

    expect(await navigator.clipboard.readText()).toContain('Final Amount: ₹1,180.00');
    expect(screen.getByText('Results copied to clipboard.')).toBeInTheDocument();
  });

  it('shows the tax disclaimer and the required sections', () => {
    setup();
    expect(screen.getByText('This calculator provides estimates and does not replace professional tax advice.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'GST Calculator' })).toBeInTheDocument();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});
