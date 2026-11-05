import { formatNumber } from '../../utils/formatResult.js';
import { formatDecimal } from '../../utils/number.js';

export const DURATIONS = [
  { id: '30', name: '30 seconds', seconds: 30 },
  { id: '60', name: '60 seconds', seconds: 60 },
  { id: '120', name: '2 minutes', seconds: 120 },
];

const BASE = [
  'The quiet river ran past the old mill and carried fallen leaves toward the town. Children stopped on the bridge to watch them drift by, and a dog barked at the water as if it could be told to stop.',
  'Good habits are built in small steps. Open the book for five minutes, take a short walk after lunch, or write down one thing you learned today. Small actions repeated every day often matter more than one big effort.',
  'Every map tells a story about the people who made it. Some show roads and rivers, while others show trade routes, old borders or places that nobody had seen. Reading one closely can teach you what its makers cared about.',
  'A good meal does not need many ingredients. Fresh vegetables, a little oil, some salt and a hot pan can do most of the work. Taste as you go, take your time, and share the result with someone you like.',
];

const LONG_PASSAGE_REPEATS = 3;

export const PASSAGES = BASE.map((_, start) =>
  Array.from({ length: BASE.length * LONG_PASSAGE_REPEATS }, (_unused, index) => BASE[(start + index) % BASE.length]).join(' '),
);

export function compareTyping(passage, typed) {
  const expected = [...passage];
  const actual = [...typed];
  let correct = 0;
  actual.forEach((character, index) => {
    if (character === expected[index]) correct += 1;
  });
  return { typed: actual.length, correct, errors: actual.length - correct };
}

export function scoreTyping(passage, typed, elapsedMs) {
  const { typed: count, correct, errors } = compareTyping(passage, typed);
  const minutes = Math.max(elapsedMs, 1000) / 60000;
  return {
    wpm: Math.round(correct / 5 / minutes),
    rawWpm: Math.round(count / 5 / minutes),
    accuracy: count > 0 ? (correct / count) * 100 : 0,
    typed: count,
    correct,
    errors,
    seconds: Math.round(elapsedMs / 1000),
  };
}

export function buildSegments(passage, typed) {
  const expected = [...passage];
  const actual = [...typed];
  const segments = [];
  const push = (kind, character) => {
    const last = segments.at(-1);
    if (last?.kind === kind) last.text += character;
    else segments.push({ kind, text: character });
  };
  expected.forEach((character, index) => {
    if (index < actual.length) push(actual[index] === character ? 'correct' : 'wrong', character);
    else if (index === actual.length) push('current', character);
    else push('rest', character);
  });
  return segments;
}

export const isFinished = (passage, typed) => [...typed].length >= [...passage].length;

export const formatAccuracy = (accuracy) => `${formatDecimal(accuracy)}%`;

export const getDetails = (score) => [
  { label: 'Raw Speed', value: `${formatNumber(score.rawWpm)} wpm` },
  { label: 'Characters Typed', value: formatNumber(score.typed) },
  { label: 'Correct Characters', value: formatNumber(score.correct) },
  { label: 'Time', value: `${formatNumber(score.seconds)} seconds` },
];

export const buildResultText = (score) => `Typing speed: ${formatNumber(score.wpm)} words per minute\nAccuracy: ${formatAccuracy(score.accuracy)}\nMistakes: ${formatNumber(score.errors)}`;

export const buildReport = (score) => ({
  results: [
    { label: 'Words per minute', value: formatNumber(score.wpm) },
    { label: 'Accuracy', value: formatAccuracy(score.accuracy) },
    { label: 'Mistakes', value: formatNumber(score.errors) },
  ],
  details: getDetails(score),
});
