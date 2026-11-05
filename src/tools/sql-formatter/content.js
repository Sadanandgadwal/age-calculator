export const howItWorks = [
  { title: 'Paste your SQL', text: 'Add a query from your code, a log or a database tool.' },
  { title: 'Choose a dialect', text: 'Pick your database, so that its own syntax and keywords are understood.' },
  { title: 'Copy the result', text: 'The formatted query updates as you type.' },
];

export const formulas = [
  { title: 'Layout', text: 'Main clauses such as SELECT, FROM and WHERE each start a new line, with their contents indented by two spaces.' },
  { title: 'Keywords', text: 'With the option on, keywords become uppercase, so they stand out from table and column names.' },
  { title: 'What stays the same', text: 'Only spacing and keyword case change. Names, values and the logic of your query do not.' },
];

export const examples = [
  { title: 'A one-line query', text: 'select a,b from t where x=1 becomes separate SELECT, FROM and WHERE sections.' },
  { title: 'Joins', text: 'Each JOIN starts its own line, which makes long queries much easier to follow.' },
  { title: 'A dialect feature', text: 'Choose SQL Server to format [bracketed] names, or MySQL for `backtick` names.' },
];

export const faqs = [
  {
    question: 'Is my query run?',
    answer: 'No. The query is only read as text, and this page has no connection to any database. So even a DELETE is safe to paste.',
  },
  {
    question: 'Why do I get a parse error?',
    answer: 'The query may have unbalanced quotes, or syntax from a different database. Try choosing the right dialect first.',
  },
  {
    question: 'Does it check that my query is correct?',
    answer: 'No. It does not know your tables, so a query can format well and still fail when you run it.',
  },
  {
    question: 'Is my SQL uploaded?',
    answer: 'No. It is formatted in your browser, so private table names and values stay with you.',
  },
];
