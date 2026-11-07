export const ANGLES = [
  { id: 'deg', name: 'Degrees' },
  { id: 'rad', name: 'Radians' },
];

const NAMES = ['asin', 'acos', 'atan', 'sqrt', 'cbrt', 'sin', 'cos', 'tan', 'log', 'ln', 'abs', 'exp', 'ans', 'pi', 'e'];
const FUNCTIONS = new Set(['asin', 'acos', 'atan', 'sqrt', 'cbrt', 'sin', 'cos', 'tan', 'log', 'ln', 'abs', 'exp']);
const MAX_LENGTH = 500;
const MAX_DEPTH = 100;

export const MESSAGES = {
  empty: 'Please enter a calculation.',
  incomplete: 'This calculation is incomplete. Check for a missing number or bracket.',
  brackets: 'There is a closing bracket without a matching opening bracket.',
  divide: 'You cannot divide by zero.',
  domain: 'This calculation has no real-number answer.',
  large: 'The answer is too large to show.',
  factorial: 'Factorial works on whole numbers from 0 to 170.',
  tan: 'Tangent is undefined at this angle.',
  long: 'This calculation is too long. Please shorten it.',
};

class CalcError extends Error {}

const fail = (message) => {
  throw new CalcError(message);
};

export function normalize(text) {
  return String(text ?? '')
    .replace(/\s+/g, '')
    .replace(/[×*]/g, '*')
    .replace(/[÷/]/g, '/')
    .replace(/[−–]/g, '-')
    .replace(/√/g, 'sqrt')
    .replace(/π/g, 'pi')
    .toLowerCase();
}

export function tokenize(text) {
  const source = normalize(text);
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const rest = source.slice(index);
    const number = rest.match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/);
    if (number) {
      tokens.push({ type: 'number', value: Number(number[0]) });
      index += number[0].length;
      continue;
    }
    const word = rest.match(/^[a-z]+/);
    if (word) {
      let position = 0;
      while (position < word[0].length) {
        const name = NAMES.find((item) => word[0].startsWith(item, position));
        if (!name) fail(`"${word[0]}" is not something this calculator understands.`);
        tokens.push({ type: FUNCTIONS.has(name) ? 'function' : 'name', value: name });
        position += name.length;
      }
      index += word[0].length;
      continue;
    }
    if ('+-*/^()!%'.includes(source[index])) {
      tokens.push({ type: 'op', value: source[index] });
      index += 1;
      continue;
    }
    fail(`"${source[index]}" is not something this calculator understands.`);
  }
  return tokens;
}

const snap = (value) => (Math.abs(value) < 1e-12 ? 0 : Number(value.toPrecision(15)));

function factorial(value) {
  if (!Number.isInteger(value) || value < 0 || value > 170) fail(MESSAGES.factorial);
  let result = 1;
  for (let step = 2; step <= value; step += 1) result *= step;
  return result;
}

function applyFunction(name, value, angle) {
  const toRadians = (degrees) => (angle === 'deg' ? (degrees * Math.PI) / 180 : degrees);
  const fromRadians = (radians) => (angle === 'deg' ? (radians * 180) / Math.PI : radians);
  switch (name) {
    case 'sin':
      return snap(Math.sin(toRadians(value)));
    case 'cos':
      return snap(Math.cos(toRadians(value)));
    case 'tan': {
      if (angle === 'deg' && (((value % 180) + 180) % 180) === 90) fail(MESSAGES.tan);
      return snap(Math.tan(toRadians(value)));
    }
    case 'asin':
    case 'acos':
      if (value < -1 || value > 1) fail(MESSAGES.domain);
      return fromRadians(Math[name](value));
    case 'atan':
      return fromRadians(Math.atan(value));
    case 'sqrt':
      if (value < 0) fail(MESSAGES.domain);
      return Math.sqrt(value);
    case 'cbrt':
      return Math.cbrt(value);
    case 'log':
    case 'ln':
      if (value <= 0) fail(MESSAGES.domain);
      return name === 'log' ? Math.log10(value) : Math.log(value);
    case 'abs':
      return Math.abs(value);
    default:
      return Math.exp(value);
  }
}

function parse(tokens, { angle, ans }) {
  let position = 0;
  let depth = 0;
  const peek = () => tokens[position];
  const isOp = (value) => peek()?.type === 'op' && peek().value === value;
  const startsOperand = () => {
    const token = peek();
    return token && (token.type !== 'op' || token.value === '(');
  };

  function expression() {
    let value = term();
    while (isOp('+') || isOp('-')) {
      const op = tokens[position++].value;
      const right = term();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  }

  function term() {
    let value = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = tokens[position++].value;
        const right = unary();
        if (op === '/' && right === 0) fail(MESSAGES.divide);
        value = op === '*' ? value * right : value / right;
      } else if (startsOperand()) {
        value *= unary();
      } else {
        return value;
      }
    }
  }

  function unary() {
    if (isOp('-')) {
      position += 1;
      return -unary();
    }
    if (isOp('+')) {
      position += 1;
      return unary();
    }
    return power();
  }

  function power() {
    const base = postfix();
    if (!isOp('^')) return base;
    position += 1;
    const exponent = unary();
    const value = base ** exponent;
    if (Number.isNaN(value)) fail(MESSAGES.domain);
    if (base === 0 && exponent < 0) fail(MESSAGES.divide);
    return value;
  }

  function postfix() {
    let value = primary();
    while (isOp('!') || isOp('%')) {
      value = tokens[position++].value === '!' ? factorial(value) : value / 100;
    }
    return value;
  }

  function primary() {
    const token = tokens[position++];
    if (!token) fail(MESSAGES.incomplete);
    if (token.type === 'number') return token.value;
    if (token.type === 'name') return { pi: Math.PI, e: Math.E, ans }[token.value];
    if (token.type === 'function') return applyFunction(token.value, isOp('(') ? primary() : postfix(), angle);
    if (token.value === '(') {
      depth += 1;
      if (depth > MAX_DEPTH) fail(MESSAGES.long);
      const value = expression();
      depth -= 1;
      if (isOp(')')) position += 1;
      else if (peek()) fail(MESSAGES.incomplete);
      return value;
    }
    if (token.value === ')') fail(depth > 0 ? MESSAGES.incomplete : MESSAGES.brackets);
    fail(MESSAGES.incomplete);
  }

  const value = expression();
  if (peek()) fail(peek().value === ')' ? MESSAGES.brackets : MESSAGES.incomplete);
  return value;
}

export function calculate(text, { angle = 'deg', ans = 0 } = {}) {
  if (!String(text ?? '').trim()) return { error: MESSAGES.empty };
  if (String(text).length > MAX_LENGTH) return { error: MESSAGES.long };
  try {
    const value = parse(tokenize(text), { angle, ans });
    if (Number.isNaN(value)) return { error: MESSAGES.domain };
    if (!Number.isFinite(value)) return { error: MESSAGES.large };
    return { value: Object.is(value, -0) ? 0 : value };
  } catch (error) {
    if (error instanceof CalcError) return { error: error.message };
    throw error;
  }
}

export function formatNumber(value) {
  if (value === 0) return '0';
  const size = Math.abs(value);
  if (size >= 1e15 || size < 1e-6) {
    const [mantissa, exponent] = value.toExponential(9).split('e');
    return `${Number(mantissa)} × 10^${Number(exponent)}`;
  }
  return String(Number(value.toPrecision(12)));
}

export const angleName = (id) => ANGLES.find((item) => item.id === id)?.name ?? 'Degrees';

export const buildResultText = ({ expression, value }) => `${expression.trim()} = ${formatNumber(value)}`;

export const buildReport = ({ expression, angle, value }, history) => ({
  inputs: [
    { label: 'Calculation', value: expression.trim() },
    { label: 'Angle mode', value: angleName(angle) },
  ],
  results: [{ label: 'Answer', value: formatNumber(value) }],
  details: history.slice(1).map((item, index) => ({ label: `Earlier ${index + 1}`, value: `${item.expression} = ${formatNumber(item.value)}` })),
});
