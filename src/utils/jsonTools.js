const WHITESPACE = ' \t\n\r';
const VALUE_END = ',]} \t\n\r';

function describeError(error, text) {
  const position = error.message.match(/position (\d+)/);
  const lineColumn = error.message.match(/line (\d+) column (\d+)/);
  let where = null;
  if (lineColumn) where = { line: Number(lineColumn[1]), column: Number(lineColumn[2]) };
  else if (position) {
    const before = text.slice(0, Number(position[1])).split('\n');
    where = { line: before.length, column: before.at(-1).length + 1 };
  }
  const message = text.trim() ? 'This is not valid JSON.' : 'Please enter some JSON.';
  return { message: where ? `Line ${where.line}, column ${where.column}: ${message}` : message, detail: error.message, ...where };
}

function readTree(text) {
  let index = 0;
  const skipSpace = () => {
    while (index < text.length && WHITESPACE.includes(text[index])) index += 1;
  };
  const readString = () => {
    const start = index;
    index += 1;
    while (text[index] !== '"') index += text[index] === '\\' ? 2 : 1;
    index += 1;
    return text.slice(start, index);
  };
  const readValue = () => {
    skipSpace();
    const first = text[index];
    if (first === '{') {
      index += 1;
      const entries = [];
      skipSpace();
      if (text[index] === '}') {
        index += 1;
        return { type: 'object', entries };
      }
      for (;;) {
        skipSpace();
        const key = readString();
        skipSpace();
        index += 1;
        entries.push({ key, value: readValue() });
        skipSpace();
        const separator = text[index];
        index += 1;
        if (separator === '}') return { type: 'object', entries };
      }
    }
    if (first === '[') {
      index += 1;
      const items = [];
      skipSpace();
      if (text[index] === ']') {
        index += 1;
        return { type: 'array', items };
      }
      for (;;) {
        items.push(readValue());
        skipSpace();
        const separator = text[index];
        index += 1;
        if (separator === ']') return { type: 'array', items };
      }
    }
    if (first === '"') return { type: 'string', raw: readString() };
    const start = index;
    while (index < text.length && !VALUE_END.includes(text[index])) index += 1;
    const raw = text.slice(start, index);
    if (raw === 'true' || raw === 'false') return { type: 'boolean', raw };
    return { type: raw === 'null' ? 'null' : 'number', raw };
  };
  return readValue();
}

export function parseJson(text) {
  try {
    JSON.parse(text);
  } catch (error) {
    return { error: describeError(error, text) };
  }
  try {
    return { tree: readTree(text) };
  } catch {
    return { error: { message: 'This JSON is nested too deeply to process.' } };
  }
}

const compareKeys = (a, b) => {
  const [first, second] = [JSON.parse(a.key), JSON.parse(b.key)];
  if (first === second) return 0;
  return first < second ? -1 : 1;
};

export function printTree(tree, { indent = '', sortKeys = false } = {}) {
  const parts = [];
  const colon = indent ? ': ' : ':';
  const write = (node, depth) => {
    const inner = indent ? `\n${indent.repeat(depth + 1)}` : '';
    const close = indent ? `\n${indent.repeat(depth)}` : '';
    if (node.type === 'object') {
      if (node.entries.length === 0) return parts.push('{}');
      const entries = sortKeys ? [...node.entries].sort(compareKeys) : node.entries;
      parts.push('{');
      entries.forEach(({ key, value }, index) => {
        parts.push(index ? `,${inner}` : inner, key, colon);
        write(value, depth + 1);
      });
      return parts.push(close, '}');
    }
    if (node.type === 'array') {
      if (node.items.length === 0) return parts.push('[]');
      parts.push('[');
      node.items.forEach((item, index) => {
        parts.push(index ? `,${inner}` : inner);
        write(item, depth + 1);
      });
      return parts.push(close, ']');
    }
    return parts.push(node.raw);
  };
  write(tree, 0);
  return parts.join('');
}

export function getTreeStats(tree) {
  const stats = { objects: 0, arrays: 0, keys: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0, depth: 0, duplicateKeys: 0 };
  const visit = (node, depth) => {
    stats.depth = Math.max(stats.depth, depth);
    if (node.type === 'object') {
      stats.objects += 1;
      stats.keys += node.entries.length;
      const names = node.entries.map(({ key }) => JSON.parse(key));
      stats.duplicateKeys += names.length - new Set(names).size;
      node.entries.forEach(({ value }) => visit(value, depth + 1));
    } else if (node.type === 'array') {
      stats.arrays += 1;
      node.items.forEach((item) => visit(item, depth + 1));
    } else {
      stats[`${node.type === 'null' ? 'null' : node.type}s`] += 1;
    }
  };
  visit(tree, 1);
  return stats;
}
