import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Page from './Page.jsx';

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/marks-percentage-calculator']}>
      <Page />
    </MemoryRouter>,
  );
  return user;
}

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const results = () => within(screen.getByRole('region', { name: 'Your Results', hidden: false }));
const calculate = (user) => user.click(screen.getByRole('button', { name: 'Calculate' }));
const fillSubject = (index, name, max, obtained) => {
  type(`Subject ${index} Subject name`, name);
  type(`Subject ${index} Maximum marks`, max);
  type(`Subject ${index} Obtained marks`, obtained);
};
const removeExtra = async (user) => {
  await user.click(screen.getByRole('button', { name: 'Remove subject 3' }));
  await user.click(screen.getByRole('button', { name: 'Remove subject 2' }));
};

describe('subject-wise mode', () => {
  it('starts with three subjects and no results', () => {
    setup();
    expect(screen.getByLabelText('Subject 3 Subject name')).toBeInTheDocument();
    expect(screen.queryByLabelText('Subject 4 Subject name')).not.toBeInTheDocument();
    expect(results().getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('calculates every result', async () => {
    const user = setup();
    fillSubject(1, 'Maths', '100', '90');
    fillSubject(2, 'Art', '50', '20');
    fillSubject(3, 'Music', '50', '40');
    await calculate(user);

    const panel = results();
    expect(panel.getByText('75%')).toBeInTheDocument();
    expect(panel.getByText('B+')).toBeInTheDocument();
    expect(panel.getByText('Total Obtained Marks').parentElement).toHaveTextContent('150');
    expect(panel.getByText('Total Maximum Marks').parentElement).toHaveTextContent('200');
    expect(panel.getByText('Average Marks').parentElement).toHaveTextContent('50');
    expect(panel.getByText('Highest Scoring').parentElement).toHaveTextContent('Maths');
    expect(panel.getByText('Lowest Scoring').parentElement).toHaveTextContent('Art');
    expect(screen.getByRole('heading', { name: 'Your Results' })).toHaveFocus();
  });

  it('adds a subject and focuses its name', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Add subject' }));
    expect(screen.getByLabelText('Subject 4 Subject name')).toHaveFocus();
  });

  it('removes a subject, but always keeps one', async () => {
    const user = setup();
    await removeExtra(user);
    expect(screen.queryByLabelText('Subject 2 Subject name')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove subject 1' })).toBeDisabled();
  });

  it('shows validation errors and focuses the first invalid field', async () => {
    const user = setup();
    await removeExtra(user);
    await calculate(user);

    expect(screen.getByText('Please enter a subject name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter the maximum marks.')).toBeInTheDocument();
    expect(screen.getByText('Please enter the obtained marks.')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject 1 Subject name')).toHaveFocus();
    expect(results().getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('rejects invalid marks', async () => {
    const user = setup();
    await removeExtra(user);
    fillSubject(1, 'Maths', '100', '101');
    await calculate(user);
    expect(screen.getByText('Obtained marks cannot exceed maximum marks.')).toBeInTheDocument();

    type('Subject 1 Obtained marks', '-1');
    expect(screen.getByText('Marks cannot be negative.')).toBeInTheDocument();

    type('Subject 1 Maximum marks', '0');
    expect(screen.getByText('Maximum marks must be greater than zero.')).toBeInTheDocument();
  });

  it('updates results as marks change after calculating', async () => {
    const user = setup();
    await removeExtra(user);
    fillSubject(1, 'Maths', '100', '50');
    await calculate(user);
    expect(results().getByText('50%')).toBeInTheDocument();

    type('Subject 1 Obtained marks', '60');
    expect(results().getByText('60%')).toBeInTheDocument();
  });

  it('resets subjects, results and errors', async () => {
    const user = setup();
    fillSubject(1, 'Maths', '100', '90');
    await user.click(screen.getByRole('button', { name: 'Add subject' }));
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByLabelText('Subject 1 Subject name')).toHaveValue('');
    expect(screen.queryByLabelText('Subject 4 Subject name')).not.toBeInTheDocument();
    expect(screen.queryByText('Please enter a subject name.')).not.toBeInTheDocument();
    expect(results().getByText('Your results will appear here')).toBeInTheDocument();
  });

  it('copies results and confirms it', async () => {
    const user = setup();
    await removeExtra(user);
    fillSubject(1, 'Maths', '100', '90');
    await calculate(user);
    await user.click(screen.getByRole('button', { name: 'Copy results' }));

    expect(await navigator.clipboard.readText()).toContain('Maths: 90 / 100 (90%)');
    expect(screen.getByText('Results copied to clipboard.')).toBeInTheDocument();
  });

  it('reports a failed copy', async () => {
    const user = setup();
    await removeExtra(user);
    fillSubject(1, 'Maths', '100', '90');
    await calculate(user);
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    await user.click(screen.getByRole('button', { name: 'Copy results' }));

    expect(screen.getByText(/Couldn't copy/)).toBeInTheDocument();
  });
});

describe('grading scale', () => {
  async function calculated(user) {
    await removeExtra(user);
    fillSubject(1, 'Maths', '100', '50');
    await calculate(user);
  }

  it('changes the grade when the scale changes', async () => {
    const user = setup();
    await calculated(user);
    expect(results().getByText('C')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Scale'), 'passFail');
    expect(results().getByText('Pass')).toBeInTheDocument();
  });

  it('applies edited grades and marks the scale as custom', async () => {
    const user = setup();
    await calculated(user);
    type('Row 5 Grade', 'Okay');

    expect(results().getByText('Okay')).toBeInTheDocument();
    expect(screen.getByLabelText('Scale')).toHaveValue('custom');
  });

  it('adds and removes grade rows', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Add grade' }));
    expect(screen.getByLabelText('Row 8 Grade')).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Remove grade row 8' }));
    expect(screen.queryByLabelText('Row 8 Grade')).not.toBeInTheDocument();
  });

  it('shows no grade while the scale is invalid', async () => {
    const user = setup();
    await calculated(user);
    await user.click(screen.getByRole('button', { name: 'Remove grade row 7' }));

    expect(screen.getByText(/Add a grade with a minimum of 0/)).toBeInTheDocument();
    expect(results().getByText('—')).toBeInTheDocument();
  });
});

describe('overall mode', () => {
  it('calculates percentage and grade, then resets', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Overall' }));
    type('Total obtained marks', '450');
    type('Total maximum marks', '500');
    await calculate(user);

    const panel = results();
    expect(panel.getByText('90%')).toBeInTheDocument();
    expect(panel.getByText('A+')).toBeInTheDocument();
    expect(panel.getByText('Marks Lost').parentElement).toHaveTextContent('50');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Total obtained marks')).toHaveValue('');
  });

  it('validates marks', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Overall' }));
    type('Total obtained marks', '600');
    type('Total maximum marks', '500');
    await calculate(user);

    expect(screen.getByText('Obtained marks cannot exceed maximum marks.')).toBeInTheDocument();
    expect(screen.getByLabelText('Total obtained marks')).toHaveFocus();
  });

  it('keeps each mode\'s entries when switching', async () => {
    const user = setup();
    type('Subject 1 Subject name', 'Maths');
    await user.click(screen.getByRole('button', { name: 'Overall' }));
    await user.click(screen.getByRole('button', { name: 'Subject-wise' }));
    expect(screen.getByLabelText('Subject 1 Subject name')).toHaveValue('Maths');
  });
});

describe('target mode', () => {
  const fill = (target, obtained, max, remaining) => {
    type('Target percentage', target);
    type('Marks obtained so far', obtained);
    type('Maximum marks so far', max);
    type('Maximum marks remaining', remaining);
  };

  it('calculates the marks needed', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Target' }));
    fill('75', '200', '250', '250');
    await calculate(user);
    expect(screen.getByText('You need 175 of the 250 marks remaining.')).toBeInTheDocument();
  });

  it('explains reached and impossible targets', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Target' }));
    fill('40', '200', '250', '250');
    await calculate(user);
    expect(screen.getByText(/already reached/)).toBeInTheDocument();

    type('Target percentage', '95');
    expect(screen.getByText(/isn't reachable.*90%/)).toBeInTheDocument();
  });

  it('hides the grading scale, which does not apply', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Target' }));
    expect(screen.queryByText('Grading scale')).not.toBeInTheDocument();
  });
});

describe('page content', () => {
  it('has the required sections', () => {
    setup();
    for (const name of ['How it works', 'Formulas', 'Examples', 'Frequently asked questions', 'Related tools']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByRole('heading', { level: 1, name: 'Marks & Percentage Calculator' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Tool: Age Calculator' })).toBeInTheDocument();
  });
});
