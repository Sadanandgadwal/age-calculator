import { describe, expect, it } from 'vitest';
import { buildReport, measure } from './logic.js';
import { minifyCode } from './minifyCode.js';

const run = (code, options = {}) => minifyCode({ code, compress: true, mangle: true, ...options });

describe('minifyCode', () => {
  it('shortens code and keeps global names', async () => {
    const { output } = await run('function add(first, second) { return first + second; }');
    expect(output).toMatch(/^function add\((\w),(\w)\)\{return \1\+\2\}$/);
  });

  it('removes dead code when compressing', async () => {
    expect((await run('if (false) { run(); } done();')).output).toBe('done();');
  });

  it('follows the options', async () => {
    const code = 'function add(first, second) { return first + second; }';
    expect((await run(code, { mangle: false })).output).toBe('function add(first,second){return first+second}');
    expect((await run('if (false) { run(); }', { compress: false })).output).toContain('run()');
  });

  it('keeps the behaviour of the code', async () => {
    const code = 'function total(items) { let sum = 0; for (const item of items) { sum += item * 2; } return sum; } globalThis.__answer = total([1, 2, 3]);';
    const { output } = await run(code);
    new Function(output)();
    expect(globalThis.__answer).toBe(12);
    delete globalThis.__answer;
  });

  it('never runs the code it minifies', async () => {
    delete globalThis.__ran;
    await run('globalThis.__ran = true;');
    expect(globalThis.__ran).toBeUndefined();
  });

  it('supports modern syntax and keeps licence comments', async () => {
    expect((await run('const a = async (b) => b?.c ?? 1; export { a };')).error).toBeUndefined();
    expect((await run('/*! licence */ run();')).output).toContain('/*! licence */');
  });

  it('explains syntax errors, with the place', async () => {
    const { error } = await run('let a = 1;\nfunction (');
    expect(error).toContain('Line 2');
  });
});

describe('logic', () => {
  it('measures the saving', () => {
    expect(measure('aaaa', 'aa')).toEqual({ before: 4, after: 2, saved: 2, percent: 50 });
  });

  it('builds the report', () => {
    const report = buildReport({ output: 'a', before: 2, after: 1, percent: 50, compress: true, mangle: false });
    expect(report.inputs[1].value).toBe('No');
    expect(report.results[1].value).toBe('1 byte');
    expect(report.text.mono).toBe(true);
  });
});
