export const howItWorks = [
  { title: 'Add or remove GST', text: 'Add GST to a price before tax, or remove it from a price that already includes GST.' },
  { title: 'Choose the rate and transaction', text: 'Pick a GST rate or enter your own. Then choose intra-state or inter-state.' },
  { title: 'Read the breakdown', text: 'See the taxable amount, CGST and SGST or IGST, total GST and final amount.' },
];

export const formulas = [
  { title: 'Adding GST', text: 'GST = amount × rate ÷ 100. Final amount = amount + GST.' },
  { title: 'Removing GST', text: 'Taxable amount = amount × 100 ÷ (100 + rate). GST = amount − taxable amount.' },
  { title: 'Splitting GST', text: 'Intra-state: CGST and SGST are half of the GST each. Inter-state: IGST is the full GST.' },
];

export const examples = [
  { title: 'Intra-state, adding 18%', text: '₹1,000 + 18% GST: CGST ₹90, SGST ₹90, total GST ₹180, final amount ₹1,180.' },
  { title: 'Inter-state, adding 18%', text: '₹1,000 + 18% GST: IGST ₹180, final amount ₹1,180.' },
  { title: 'Removing 18%', text: '₹1,180 including 18% GST: taxable amount ₹1,000 and GST ₹180.' },
];

export const faqs = [
  {
    question: 'When do I use CGST and SGST, or IGST?',
    answer:
      'A sale within one state is intra-state and splits GST equally into CGST and SGST. A sale between states is inter-state and uses IGST. Union territories without a legislature use UTGST in place of SGST.',
  },
  {
    question: 'Why are 12% and 28% listed as older rates?',
    answer:
      'From 22 September 2025, GST moved mainly to 5% and 18%, with a 40% rate for certain goods, and most items at 12% and 28% moved to other rates. They remain here for older invoices. Always check the current rate for your item.',
  },
  {
    question: 'Why might CGST and SGST differ by one paisa?',
    answer:
      'If the total GST is an odd number of paise, it cannot split evenly. CGST takes the extra paisa here so the parts add up to the total. Invoices may round differently.',
  },
  {
    question: 'Can I rely on this for filing returns?',
    answer:
      'This calculator provides estimates and does not replace professional tax advice. Rates, exemptions and rounding depend on the item and your situation, so confirm them with a tax professional.',
  },
];
