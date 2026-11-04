export const howItWorks = [
  { title: 'Enter your shift', text: 'Add your clock-in and clock-out times. A clock-out earlier than clock-in counts as the next day.' },
  { title: 'Add your break', text: 'Enter any unpaid break in minutes. Leave it blank if you did not take one.' },
  { title: 'See your hours', text: 'Get your net working hours, plus any overtime or shortfall against your daily hours.' },
];

export const formulas = [
  { title: 'Total shift', text: 'Total shift = clock-out − clock-in, plus 24 hours for an overnight shift' },
  { title: 'Net working hours', text: 'Net working hours = total shift − break' },
  { title: 'Overtime', text: 'Overtime = net working hours − daily working hours, if above zero' },
];

export const examples = [
  { title: 'Day shift', text: '9:00 AM to 6:00 PM with a 60 minute break is 8 net hours, with no overtime on an 8 hour day.' },
  { title: 'Overtime', text: '9:00 AM to 8:00 PM with a 60 minute break is 10 net hours, including 2 hours of overtime.' },
  { title: 'Overnight shift', text: '10:00 PM to 6:00 AM with a 30 minute break is 7 hours 30 minutes.' },
];

export const faqs = [
  {
    question: 'How do I enter an overnight shift?',
    answer: 'Enter the times as usual. If clock-out is earlier than clock-in, it is treated as the next day, and the result says so.',
  },
  {
    question: 'How is overtime calculated?',
    answer: 'Any net hours above your daily working hours count as overtime. Set the daily hours to match your job. Pay rules vary, so check your contract or local law.',
  },
  {
    question: 'What are decimal hours?',
    answer: 'They show time as a single number for timesheets and payroll. For example, 7 hours 30 minutes is 7.5 hours.',
  },
  {
    question: 'Can it handle shifts longer than 24 hours?',
    answer: 'No. It handles one shift of less than 24 hours, because clock times alone cannot show more than one day.',
  },
];
