import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { preview } from 'vite';

const OUT = process.env.PRINT_OUT ?? join(tmpdir(), 'toolnest-print');
const ONLY = process.env.PRINT_ONLY;
const A4 = { width: 595.28, height: 841.89 };
const CONTENT_WIDTH = 703;
const FORBIDDEN = ['Formula', 'Calculation steps', 'Copy results', 'Reset', 'Related', 'Frequently asked', 'All Tools', 'How it works', 'Advertisement', 'Your results will appear'];

const converter = (route, value, expected) => ({ route, steps: [['#convert-value', value]], expected });
const calc = (label = 'Calculate') => ['click', label];

const CASES = [
  { route: '/age-calculator', steps: [['#dob', '2000-01-15'], ['#asOf', '2026-11-04'], calc('Calculate Age')], expected: ['Years', 'Age Calculator', '15 Jan 2000', '26', 'Total days lived', 'Next birthday on'] },
  { route: '/marks-percentage-calculator', steps: [['#subject-1-name', 'Maths'], ['#subject-1-max', '100'], ['#subject-1-obtained', '80'], ['#subject-2-name', 'Science'], ['#subject-2-max', '100'], ['#subject-2-obtained', '70'], ['#subject-3-name', 'English'], ['#subject-3-max', '100'], ['#subject-3-obtained', '90'], calc()], expected: ['Marks by subject', 'Maths', '80', 'Science'] },
  { name: 'marks-overall', route: '/marks-percentage-calculator', steps: [['#subject-1-name', 'Hidden subject'], ['#subject-1-max', '100'], ['#subject-1-obtained', '80'], ['#subject-2-name', 'Science'], ['#subject-2-max', '100'], ['#subject-2-obtained', '70'], ['#subject-3-name', 'English'], ['#subject-3-max', '100'], ['#subject-3-obtained', '90'], calc(), ['click', 'Overall'], ['#overall-obtained', '450'], ['#overall-max', '500'], calc()], visibleOnly: true, expected: ['90%', 'Marks lost', 'Overall marks'], absent: ['Hidden subject'] },
  { name: 'marks-target', route: '/marks-percentage-calculator', steps: [['click', 'Target'], ['#target-percent', '75'], ['#target-obtained', '60'], ['#target-max', '100'], ['#target-remaining', '100'], calc()], visibleOnly: true, expected: ['Marks needed', 'Target marks', '90'] },
  { route: '/percentage-calculator', steps: [['#percent-a', '20'], ['#percent-b', '500'], calc()], expected: ['20% of 500 is 100'] },
  converter('/kg-to-gram-converter', '2.5', ['2,500', 'Kilogram']),
  converter('/cm-to-feet-converter', '180', ['ft']),
  { route: '/date-calculator', steps: [['#date-end', '2026-12-31'], ['#date-start', '2026-01-01'], calc()], expected: ['Weekend days', '1 Jan 2026', '31 Dec 2026', 'Years, months and days'] },
  { name: 'date-shift', route: '/date-calculator', steps: [['click', 'Add days'], ['#date-start', '2026-01-01'], ['#date-amount', '10'], calc()], expected: ['11 Jan 2026', 'Days to add', 'Calculation'] },
  { route: '/gst-calculator', steps: [['#gst-amount', '1000'], calc()], expected: ['Taxable amount', 'Final amount', 'CGST', 'Add GST'], absent: ['Not applicable'] },
  { route: '/emi-calculator', steps: [['#emi-amount', '500000'], ['#emi-rate', '9'], ['#emi-tenure', '5'], calc()], expected: ['Monthly EMI', 'Yearly schedule', 'Balance'] },
  { name: 'emi-30-years', route: '/emi-calculator', steps: [['#emi-amount', '5000000'], ['#emi-rate', '9'], ['#emi-tenure', '30'], calc()], expected: ['Yearly schedule', 'Balance'] },
  { name: 'emi-100-years', route: '/emi-calculator', steps: [['#emi-amount', '5000000'], ['#emi-rate', '9'], ['#emi-tenure', '100'], calc()], expected: ['Yearly schedule'], maxPages: 4 },
  { route: '/time-calculator', steps: [['click', 'Time between'], ['#time-start', '09:00'], ['#time-end', '17:30'], calc()], expected: ['Duration', '8 hours', 'Start time', 'End time'] },
  { route: '/discount-calculator', steps: [['#discount-a', '2000'], ['#discount-b', '25'], calc()], expected: ['Final price', 'You save', '25%'] },
  { route: '/bill-split-calculator', steps: [['#bill-amount', '1000'], ['#bill-people', '4'], calc()], expected: ['Each person pays', '250', 'Number of people'] },
  converter('/temperature-converter', '100', ['212', 'Fahrenheit']),
  converter('/area-converter', '100', ['Conversion rate']),
  converter('/volume-converter', '10', ['Conversion rate']),
  converter('/data-storage-converter', '2', ['MB']),
  converter('/speed-converter', '100', ['mph']),
  converter('/time-unit-converter', '2', ['120']),
  converter('/pressure-converter', '100', ['bar']),
  converter('/energy-converter', '100', ['Conversion rate']),
  converter('/frequency-converter', '2', ['2,000']),
  converter('/angle-converter', '180', ['rad']),
  { route: '/countdown-timer', steps: [['#countdown-name', 'Launch day'], ['#countdown-date', '2099-01-01'], ['#countdown-time', '10:30'], calc('Start')], expected: ['Days', 'Seconds', 'Launch day', '1 Jan 2099', '10:30'] },
  { route: '/stopwatch', steps: [calc('Start'), ['wait', 250], calc('Lap'), ['wait', 250], calc('Lap'), calc('Pause')], expected: ['Elapsed time', 'Lap records', 'Lap time'] },
  { name: 'stopwatch-many-laps', route: '/stopwatch', steps: [calc('Start'), ...Array.from({ length: 80 }, () => calc('Lap')), calc('Pause')], expected: ['Lap records'], maxPages: 3 },
  { route: '/time-zone-converter', steps: [['#tz-date', '2026-06-15'], ['#tz-time', '12:00'], calc()], expected: ['Converted time', 'Converted date', 'From time zone', 'To time zone', 'Time difference'] },
  { route: '/business-days-calculator', steps: [['#biz-start', '2026-01-01'], ['#biz-end', '2026-01-31'], ['#biz-holiday', '2026-01-26'], calc('Add holiday'), calc()], expected: ['Working days', 'Weekend days', 'Holidays excluded', '26 Jan 2026'] },
  { route: '/day-of-week-calculator', steps: [['#dow-date', '2026-11-04'], calc()], expected: ['Wednesday', 'Day of the year', '4 Nov 2026'] },
  { route: '/pomodoro-timer', steps: [calc('Start'), calc('Pause')], expected: ['Focus sessions completed', 'Focus session', '25 minutes', 'Short break'] },
  { route: '/leap-year-checker', steps: [['#leap-year', '2024'], calc()], expected: ['2024', 'Yes', 'Divides by 400'] },
  { route: '/week-number-calculator', steps: [['#week-date', '2026-11-04'], calc()], expected: ['ISO week number', 'Week start', 'Week end', '45'] },
  { route: '/work-hours-calculator', steps: [['#work-in', '09:00'], ['#work-out', '18:30'], ['#work-break', '30'], calc()], expected: ['Net working hours', 'Overtime', '9 h 0 min', 'Clock-in', 'Clock-out', 'Break'] },
  { route: '/unix-timestamp-converter', steps: [['#unix-timestamp', '1700000000'], calc()], expected: ['UTC', '14 Nov 2023', '1700000000', 'Local'] },
  { route: '/word-counter', steps: [['#word-text', 'One two three. Four five!']], expected: ['Words', 'Sentences', 'Reading Time', 'One two three'] },
  { route: '/character-counter', steps: [['#char-text', 'Hello there'], ['#char-limit', '160']], expected: ['Character limit', '149 left of 160', 'Letters', 'Hello there'] },
  { route: '/line-counter', steps: [['#line-text', 'one\n\ntwo']], expected: ['Total lines', 'Blank lines', 'Longest Line'] },
  { route: '/reading-time-calculator', steps: [['#read-text', 'word word word word word']], expected: ['Speaking time', 'Reading speed', 'Reading time'] },
  { route: '/case-converter', steps: [['#case-text', 'hello big world'], ['click', 'camelCase']], expected: ['Converted to', 'camelCase', 'helloBigWorld'] },
  { route: '/text-reverser', steps: [['#reverse-text', 'Hello there']], expected: ['Reversed by', 'Reversed text', 'ereht olleH'] },
  { route: '/remove-duplicate-lines', steps: [['#dedupe-text', 'pear\nplum\npear']], expected: ['Lines kept', 'Lines removed', 'Cleaned list', 'plum'] },
  { route: '/remove-extra-spaces', steps: [['#spaces-text', 'one    two']], expected: ['Characters removed', 'Cleaned text', 'one two'] },
  { route: '/find-replace-text', steps: [['#replace-text', 'one two one'], ['#replace-find', 'one'], ['#replace-with', 'three'], ['click', 'Replace all']], expected: ['Replacements made', 'Find', 'Replace with', 'three two three'] },
  { route: '/text-sorter', steps: [['#sort-text', 'pear\napple\nplum']], expected: ['Order', 'A to Z', 'Sorted lines', 'apple'] },
  { route: '/slug-generator', steps: [['#slug-text', 'Hello Big World']], expected: ['Title', 'Separator', 'hello-big-world'] },
  { route: '/lorem-ipsum-generator', steps: [], expected: ['Words', 'Paragraphs', 'Placeholder text', 'Lorem ipsum dolor'] },
  { route: '/random-number-generator', steps: [['#random-min', '7'], ['#random-max', '7'], ['click', 'Generate']], expected: ['Lowest number', 'Highest number', 'Random number', '7'] },
  { route: '/password-generator', noPrint: true, steps: [['click', 'Generate']], expected: [] },
  { route: '/qr-code-generator', steps: [['#qr-text', 'https://example.com']], expected: ['Modules per side', 'Text or link', 'https://example.com', 'Error correction'] },
  { route: '/json-formatter', steps: [['#json-format-text', '{"name":"Asha","age":30}']], expected: ['Indent', '2 spaces', 'Formatted JSON', '"name": "Asha"'] },
  { route: '/json-validator', steps: [['#json-validate-text', '{"a":[1,2]}']], expected: ['Valid JSON', 'Objects', 'Deepest Level'] },
  { route: '/json-minifier', steps: [['#json-minify-text', '{ "a" : 1 }']], expected: ['Saved', 'Minified size', 'Minified JSON', '{"a":1}'] },
  { route: '/base64-encoder-decoder', steps: [['#base64-text', 'Hello']], expected: ['Action', 'Encode', 'SGVsbG8='] },
  { route: '/url-encoder-decoder', steps: [['#url-text', 'a b']], expected: ['Action', 'Applies to', 'a%20b'] },
  { route: '/html-entity-encoder', steps: [['#entity-text', '<b>Hi</b>']], expected: ['Action', 'Encoded text', '&lt;b&gt;Hi&lt;/b&gt;'] },
  { route: '/uuid-generator', steps: [['click', 'Generate']], expected: ['UUID created', 'Version', 'Version 4'] },
  { route: '/hash-generator', steps: [['#hash-text', 'abc'], ['wait', 300]], expected: ['ba7816bf8f01cfea', 'MD5', 'SHA-512', 'can be forged'] },
  { route: '/jwt-decoder', noPrint: true, steps: [['#jwt-token', 'eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiQXNoYSJ9.c2ln']], expected: [] },
  { route: '/regex-tester', steps: [['#regex-pattern', '(\\d+)'], ['#regex-text', 'On 15 May 2026'], ['wait', 800]], expected: ['Pattern', 'Flags', 'Position', '2026', 'Test text'] },
  { route: '/markdown-preview', steps: [['#markdown-text', '# Hello there\n\n- First item\n\n| A | B |\n|---|---|\n| 1 | 2 |']], expected: ['Words', 'Hello there', 'First item'] },
  { route: '/html-formatter', steps: [['#html-text', '<ul><li>One</li></ul>']], expected: ['Indent', 'Formatted HTML', '<li>One</li>'] },
  { route: '/css-minifier', steps: [['#css-text', 'a { color: #ffffff; }']], expected: ['Saved', 'Minified size', 'Minified CSS', 'a{color:#fff}'] },
  { route: '/javascript-minifier', steps: [['#js-text', 'function add(first, second) { return first + second; }'], ['click', 'Minify'], ['wait', 1500]], expected: ['Saved', 'Compress code', 'Minified JavaScript', 'function add('] },
  { route: '/sql-formatter', steps: [['#sql-text', 'select a from t']], expected: ['Dialect', 'Standard SQL', 'Formatted SQL', 'SELECT'] },
  { route: '/coin-flip', steps: [['click', 'Flip']], expected: ['Number of flips', 'Result'] },
  { route: '/dice-roller', steps: [['click', 'Roll']], expected: ['Dice', '1d6', 'Total', 'Every roll'] },
  { route: '/random-name-picker', steps: [['#names-text', 'Asha'], ['click', 'Pick']], expected: ['Names in the list', 'Winner', 'Asha'] },
  { route: '/decision-maker', steps: [['#decide-options', 'Tea | 3\nCoffee'], ['click', 'Decide']], expected: ['Decision', 'All options', '75%', 'Coffee'] },
  { route: '/uptime-calculator', steps: [['#uptime-percent', '99.9']], expected: ['Uptime', '99.9%', 'Allowed downtime per year', '8 h 45 min 57.6 s', '365.25'] },
  { route: '/screen-resolution-checker', steps: [], expected: ['Screen resolution', 'Browser window', 'Pixel ratio', 'Aspect Ratio'] },
  { route: '/typing-speed-test', steps: [['fill-from', '[data-testid="passage"]', '#typing-input'], ['wait', 200]], expected: ['Words per minute', 'Accuracy', 'Mistakes', 'Raw Speed'] },
  { route: '/barcode-generator', steps: [['#barcode-value', 'SKU-10482']], expected: ['Value', 'SKU-10482', 'Format', 'Code 128', 'Barcode'] },
  { route: '/qr-code-scanner', steps: [['upload', '#qr-file', 'scripts/fixtures/qr-example.png'], ['wait', 600]], expected: ['Scanned from', 'Image', 'Web link', 'https://example.com/toolnest-test', 'Check the address'] },
  { route: '/image-to-base64', noPrint: true, steps: [['upload', '#base64-file', 'scripts/fixtures/image-sample.png'], ['wait', 500]], expected: [] },
  { route: '/base64-to-image', fileOnly: true, steps: [['#base64-input', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYPj/HwADAgH/h0Bh2AAAAABJRU5ErkJggg=='], ['wait', 300]], expected: [] },
  { route: '/image-color-picker', steps: [['upload', '#color-file', 'scripts/fixtures/image-sample.png'], ['wait', 600]], expected: ['Image', 'image-sample.png', 'HEX', '#FFFF00', 'rgb(255, 255, 0)', 'hsl(60, 100%, 50%)', 'Main color 1'] },
  { route: '/image-compressor', fileOnly: true, steps: [['upload', '#compress-file', 'scripts/fixtures/image-photo.jpg'], ['wait', 700]], expected: [] },
  { route: '/image-resizer', fileOnly: true, steps: [['upload', '#resize-file', 'scripts/fixtures/image-photo.jpg'], ['wait', 800]], expected: [] },
  { route: '/image-cropper', fileOnly: true, steps: [['upload', '#crop-file', 'scripts/fixtures/image-photo.jpg'], ['wait', 800]], expected: [] },
  { route: '/favicon-generator', fileOnly: true, steps: [['upload', '#favicon-file', 'scripts/fixtures/image-sample.png'], ['wait', 1200]], expected: [] },
  { route: '/passport-photo-maker', steps: [['upload', '#passport-file', 'scripts/fixtures/image-photo.jpg'], ['wait', 1500]], expected: ['Document', 'India passport', '35 × 45 mm', 'Photos on this page', 'Actual size', 'official requirements'] },
  { route: '/image-to-text', noPrint: true, steps: [['upload', '#ocr-file', 'scripts/fixtures/ocr-sample.png'], ['wait', 15000]], expected: [] },
  { route: '/pdf-page-counter', steps: [['upload', '#count-files', 'scripts/fixtures/pdf-sample.pdf'], ['wait', 1500]], expected: ['Total pages', '6', 'Files counted', 'pdf-sample.pdf', 'ToolNest Sample', 'Mixed'] },
  { route: '/merge-pdf', fileOnly: true, steps: [['upload', '#merge-files', 'scripts/fixtures/pdf-sample.pdf'], ['wait', 800], ['upload', '#merge-files', 'scripts/fixtures/pdf-short.pdf'], ['wait', 800], ['click', 'Merge PDFs'], ['wait', 1000]], expected: [] },
  { route: '/split-pdf', fileOnly: true, steps: [['upload', '#split-file', 'scripts/fixtures/pdf-sample.pdf'], ['wait', 800], ['click', 'Every page'], ['click', 'Split PDF'], ['wait', 1500]], expected: [] },
  { route: '/extract-pdf-pages', fileOnly: true, steps: [['upload', '#extract-file', 'scripts/fixtures/pdf-sample.pdf'], ['wait', 1000], ['#extract-pages', '1-2'], ['click', 'Extract pages'], ['wait', 1000]], expected: [] },
  { route: '/delete-pdf-pages', fileOnly: true, steps: [['upload', '#delete-file', 'scripts/fixtures/pdf-sample.pdf'], ['wait', 1000], ['#delete-pages', '2'], ['click', 'Delete pages'], ['wait', 1000]], expected: [] },
  { route: '/rotate-pdf', fileOnly: true, steps: [['upload', '#rotate-file', 'scripts/fixtures/pdf-sample.pdf'], ['wait', 1000], ['click', 'Right'], ['click', 'Save rotated PDF'], ['wait', 1000]], expected: [] },
  { route: '/reorder-pdf-pages', fileOnly: true, steps: [['upload', '#reorder-file', 'scripts/fixtures/pdf-sample.pdf'], ['wait', 1000], ['click', 'Reverse order'], ['click', 'Save new order'], ['wait', 1000]], expected: [] },
  { route: '/pdf-to-jpg', fileOnly: true, steps: [['upload', '#jpg-file', 'scripts/fixtures/pdf-short.pdf'], ['wait', 800], ['click', 'Convert to JPG'], ['wait', 3000]], expected: [] },
  { route: '/jpg-to-pdf', fileOnly: true, steps: [['upload', '#pdf-images', 'scripts/fixtures/image-photo.jpg'], ['wait', 800], ['click', 'Create PDF'], ['wait', 1500]], expected: [] },
  { route: '/protect-pdf', fileOnly: true, steps: [['upload', '#protect-file', 'scripts/fixtures/pdf-short.pdf'], ['wait', 800], ['#protect-password', 'Tiger-Moon-42'], ['#protect-confirm', 'Tiger-Moon-42'], ['click', 'Protect PDF'], ['wait', 1000]], expected: [] },
  { route: '/unlock-pdf', fileOnly: true, steps: [['upload', '#unlock-file', 'scripts/fixtures/pdf-locked.pdf'], ['wait', 800], ['#unlock-password', 'open123'], ['click', 'Unlock PDF'], ['wait', 1000]], expected: [] },
  { route: '/compress-pdf', fileOnly: true, steps: [['upload', '#compress-file', 'scripts/fixtures/pdf-photo.pdf'], ['wait', 800], ['click', 'Compress PDF'], ['wait', 3000]], expected: [] },
  { route: '/word-to-pdf', fileOnly: true, steps: [['upload', '#word-file', 'scripts/fixtures/word-sample.docx'], ['wait', 500], ['click', 'Convert to PDF'], ['wait', 4000]], expected: [] },
  { route: '/pdf-to-word', fileOnly: true, steps: [['upload', '#word-pdf-file', 'scripts/fixtures/pdf-sample.pdf'], ['wait', 800], ['click', 'Convert to Word'], ['wait', 3000]], expected: [] },
  { route: '/scientific-calculator', steps: [['#sci-expression', '2^10+sin(30)'], calc()], expected: ['Answer', '1024.5', 'Degrees'] },
  { route: '/average-calculator', steps: [['#average-numbers', '70, 85, 90, 75'], calc()], expected: ['Average (mean)', '80', 'Median', '70, 85, 90, 75'] },
  { route: '/ratio-calculator', steps: [['#ratio-a', '12'], ['#ratio-b', '16'], calc()], expected: ['Simplest form', '1 : 1.33', 'First number (A)'] },
  { route: '/fraction-calculator', steps: [['#fraction-a', '1/2'], ['#fraction-b', '1/3'], calc()], expected: ['Answer', '5/6', 'First fraction', '+ Add'] },
  { route: '/gpa-calculator', steps: [['#gpa-1-name', 'Maths'], ['#gpa-1-grade', 'A'], ['#gpa-1-credits', '4'], ['#gpa-2-grade', 'B+'], ['#gpa-2-credits', '3'], calc()], expected: ['GPA', '3.70 out of 4', '1. Maths', 'Total credits'] },
  { route: '/cgpa-to-percentage-calculator', steps: [['#cgpa-value', '8.6'], calc()], expected: ['Percentage', '81.7%', 'CBSE (CGPA × 9.5)', 'Notes'] },
  { route: '/grade-calculator', steps: [['#assessment-1-name', 'Midterm'], ['#assessment-1-score', '80'], ['#assessment-1-weight', '20'], ['#assessment-2-score', '70'], ['#assessment-2-weight', '30'], ['#grade-target', '75'], calc()], expected: ['Weighted score', '74%', '1. Midterm', 'You need 76%'] },
  { route: '/profit-loss-calculator', steps: [['#profit-a', '800'], ['#profit-b', '1000'], calc()], expected: ['Result', 'Profit', '₹200.00', '25%', 'Margin'] },
  { route: '/markup-calculator', steps: [['#markup-a', '400'], ['#markup-b', '50'], calc()], expected: ['Selling price', '₹600.00', 'Markup', '33.33%'] },
  { route: '/tip-calculator', steps: [['#tip-bill', '2400'], ['#tip-percent', '15'], ['#tip-people', '4'], calc()], expected: ['Each person pays', '₹690.00', '₹360.00', 'Round up each share'] },
  { route: '/sales-tax-calculator', steps: [['#tax-amount', '250'], ['#tax-rate', '8'], calc()], expected: ['Tax', '₹20.00', '₹270.00', 'Price before tax (₹)'] },
  { route: '/loan-payoff-calculator', steps: [['#payoff-balance', '1000000'], ['#payoff-rate', '8.5'], ['#payoff-tenure', '20'], ['#payoff-extra', '5000'], calc()], expected: ['Interest saved', '₹6,69,067.37', 'Yearly schedule with extra payments', 'Balance'] },
  { route: '/compound-interest-calculator', steps: [['#ci-principal', '100000'], ['#ci-rate', '8'], ['#ci-years', '5'], calc()], expected: ['Final amount', '₹1,48,594.74', 'Yearly growth', 'Quarterly'] },
  { route: '/simple-interest-calculator', steps: [['#si-principal', '50000'], ['#si-rate', '8'], ['#si-time', '3'], calc()], expected: ['Interest', '₹12,000.00', '₹62,000.00', 'Principal (₹)'] },
  { route: '/savings-goal-calculator', steps: [['#savings-goal', '1000000'], ['#savings-rate', '8'], ['#savings-years', '5'], calc()], expected: ['Save each month', '₹13,609.73', 'Yearly progress'] },
  { route: '/retirement-calculator', steps: [['#retire-age', '30'], ['#retire-expenses', '50000'], ['#retire-preReturn', '12'], ['#retire-savings', '500000'], calc()], expected: ['Money needed at retirement', '₹7,48,85,443.07', 'Notes'] },
  { route: '/investment-return-calculator', steps: [['#return-invested', '100000'], ['#return-current', '200000'], ['#return-years', '5'], calc()], expected: ['Yearly return (CAGR)', '14.87%', 'Doubles every'] },
  { route: '/sip-calculator', steps: [['#sip-monthly', '5000'], ['#sip-years', '10'], calc()], expected: ['Expected value', '₹11,61,695.38', 'Yearly growth', 'Notes'] },
  { route: '/inflation-calculator', steps: [['#inflation-amount', '100000'], ['#inflation-years', '10'], calc()], expected: ['Cost in 10 years', '₹1,79,084.77', 'Buying power lost'] },
  { route: '/salary-calculator', steps: [['#salary-amount', '50000'], calc()], expected: ['Yearly', '₹6,00,000.00', 'Pay for each period', '₹288.46'] },
  { route: '/number-base-converter', steps: [['#base-value', '255']], expected: ['Binary', '11111111', 'Hexadecimal', 'FF'] },
  { route: '/binary-to-decimal-converter', steps: [['#binary-value', '1011']], expected: ['Binary', 'Decimal', '11', 'Hexadecimal'] },
  { route: '/decimal-to-hex-converter', steps: [['#hex-value', '255']], expected: ['Hexadecimal', 'FF', 'Binary'] },
  { route: '/roman-numeral-converter', steps: [['#roman-value', '2026']], expected: ['Roman numeral', 'MMXXVI', 'Parts'] },
  { route: '/paper-size-converter', steps: [], expected: ['A4', '210 × 297 mm', '2,480 × 3,508 px'] },
  { route: '/color-code-converter', steps: [['#color-value', '#1A73E8']], expected: ['HEX', '#1A73E8', 'rgb(26, 115, 232)', 'CMYK'] },
  { route: '/cooking-converter', steps: [['#cook-value', '1']], expected: ['125.39 g', 'All-purpose flour (maida)', 'Notes'] },
  { route: '/shoe-size-converter', steps: [], expected: ['UK', '8.5', 'Men’s shoes size chart'] },
  { route: '/clothing-size-converter', steps: [], expected: ['Letter', 'India', '40', 'size chart'] },
  { route: '/currency-converter', steps: [['#currency-rate', '0.012'], ['#currency-amount', '1000']], expected: ['Converted amount', 'USD 12.00', 'Rate you entered'] },
  { route: '/image-converter', fileOnly: true, steps: [['upload', '#convert-files', 'scripts/fixtures/image-sample.png'], ['wait', 500], ['click', 'Convert images'], ['wait', 1500]], expected: [] },
  { route: '/audio-converter', fileOnly: true, steps: [['upload', '#audio-file', 'scripts/fixtures/audio-sample.wav'], ['wait', 1500], ['click', 'Convert to WAV'], ['wait', 1500]], expected: [] },
];

const failures = [];
const check = (label, ok, detail = '') => {
  if (!ok) failures.push(`${label}${detail ? `: ${detail}` : ''}`);
};

const registry = readFileSync(new URL('../src/data/toolsRegistry.js', import.meta.url), 'utf8');
for (const [, route] of registry.matchAll(/route: '([^']+)'/g)) {
  check(`every tool has a print case: ${route}`, CASES.some((item) => item.route === route));
}

async function setField(page, selector, value) {
  await page.waitForSelector(selector);
  await page.$eval(
    selector,
    (element, next) => {
      const protos = { SELECT: HTMLSelectElement, TEXTAREA: HTMLTextAreaElement };
      const proto = (protos[element.tagName] ?? HTMLInputElement).prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(element, next);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    },
    value,
  );
}

async function clickButton(page, text) {
  const clicked = await page.evaluate((label) => {
    const buttons = [...document.querySelectorAll('button, [role="tab"], [role="radio"]')].filter((node) => node.textContent.trim() === label && node.offsetParent !== null);
    const button = buttons.at(-1);
    button?.click();
    return Boolean(button);
  }, text);
  if (!clicked) throw new Error(`No button named ${text}`);
  await new Promise((resolve) => setTimeout(resolve, 30));
}

async function run(browser, siteUrl, item) {
  const name = item.name ?? item.route.slice(1);
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewport({ width: 1280, height: 900 });
  await page.evaluateOnNewDocument(() => {
    window.__prints = 0;
    window.print = () => {
      window.__prints += 1;
    };
  });
  await page.goto(`${siteUrl.replace(/\/$/, '')}${item.route}`, { waitUntil: 'networkidle0' });

  for (const step of item.steps) {
    if (step[0] === 'click') await clickButton(page, step[1]);
    else if (step[0] === 'wait') await new Promise((resolve) => setTimeout(resolve, step[1]));
    else if (step[0] === 'upload') await (await page.$(step[1])).uploadFile(step[2]);
    else if (step[0] === 'fill-from') await setField(page, step[2], await page.$eval(step[1], (element) => element.textContent));
    else await setField(page, step[0], step[1]);
  }

  if (item.fileOnly) {
    const names = await page.$$eval('button', (buttons) => buttons.map((button) => button.textContent.trim()));
    check(`${name}: offers only a download`, names.some((label) => label.startsWith('Download')) && !['Print', 'Share', 'Copy results'].some((label) => names.includes(label)));
    console.log(`  ${name}: file only`);
    await page.close();
    return;
  }

  if (item.noPrint) {
    const names = await page.$$eval('button', (buttons) => buttons.map((button) => button.textContent.trim()));
    check(`${name}: offers no Print button`, !names.includes('Print') && names.includes('Copy results'));
    console.log(`  ${name}: no print`);
    await page.close();
    return;
  }

  await clickButton(page, 'Print');
  check(`${name}: Print button calls the browser`, (await page.evaluate(() => window.__prints)) === 1);

  await page.setViewport({ width: CONTENT_WIDTH, height: 1000 });
  await page.emulateMediaType('print');
  const layout = await page.evaluate(() => {
    window.dispatchEvent(new Event('beforeprint'));
    const reports = document.querySelectorAll('.print-report');
    const limit = reports[0]?.getBoundingClientRect().right ?? 0;
    const clipped = [...document.querySelectorAll('.print-report *')]
      .filter((node) => !node.closest('svg') && (node.getBoundingClientRect().right > limit + 1 || node.scrollWidth > node.clientWidth + 1 && getComputedStyle(node).display !== 'inline'))
      .map((node) => node.className || node.tagName);
    const rootHidden = getComputedStyle(document.getElementById('root')).display === 'none';
    window.dispatchEvent(new Event('afterprint'));
    return { count: reports.length, clipped, rootHidden };
  });
  await new Promise((resolve) => setTimeout(resolve, 30));
  check(`${name}: exactly one report`, layout.count === 1, String(layout.count));
  check(`${name}: nothing else prints`, layout.rootHidden);
  check(`${name}: no clipped content`, layout.clipped.length === 0, layout.clipped.join(','));
  await page.emulateMediaType(null);

  const file = join(OUT, `${name}.pdf`);
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.pdf({ path: file, preferCSSPageSize: true, printBackground: false });
  const left = await page.evaluate(() => {
    window.dispatchEvent(new Event('afterprint'));
    return new Promise((resolve) => setTimeout(() => resolve(document.querySelectorAll('.print-report').length), 30));
  });
  check(`${name}: report removed after printing`, left === 0, String(left));

  const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });
  const pages = Number(info.match(/Pages:\s+(\d+)/)[1]);
  const [, width, height] = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
  check(`${name}: A4`, Math.abs(width - A4.width) < 1 && Math.abs(height - A4.height) < 1, `${width}x${height}`);
  check(`${name}: at most ${item.maxPages ?? 1} page(s)`, pages <= (item.maxPages ?? 1), String(pages));

  const lower = execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' }).toLowerCase();
  for (const wanted of ['ToolNest', 'Generated on', ...item.expected]) check(`${name}: shows ${wanted}`, lower.includes(wanted.toLowerCase()));
  for (const banned of [...FORBIDDEN, ...(item.absent ?? [])]) check(`${name}: hides ${banned}`, !lower.includes(banned.toLowerCase()));
  check(`${name}: no page errors`, errors.length === 0, errors.join('; '));

  console.log(`${pages === 1 ? ' ' : '*'} ${name}: ${pages} page(s)`);
  await page.close();
}

mkdirSync(OUT, { recursive: true });
const server = await preview({ preview: { port: 4179 }, logLevel: 'silent' });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const siteUrl = server.resolvedUrls.local[0];

for (const item of CASES) {
  if (ONLY && !(item.name ?? item.route).includes(ONLY)) continue;
  try {
    await run(browser, siteUrl, item);
  } catch (error) {
    failures.push(`${item.name ?? item.route}: ${error.message}`);
  }
}

await browser.close();
await server.close();
console.log(failures.length ? `\nFAILED ${failures.length}:\n${failures.join('\n')}` : `\nAll print checks passed. PDFs in ${OUT}`);
process.exit(failures.length ? 1 : 0);
