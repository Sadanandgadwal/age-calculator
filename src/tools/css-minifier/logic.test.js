import { describe, expect, it } from 'vitest';
import { buildReport, describeProblems, evaluate } from './logic.js';

describe('CSS Minifier', () => {
  it('removes spaces and comments, and shortens values', () => {
    expect(evaluate('a { color: #ffffff; /* note */ margin: 0 0 0 0; }', true).result.output).toBe('a{color:#fff;margin:0}');
  });

  it('can merge matching rules, or not', () => {
    expect(evaluate('a { color: red } b { color: red }', true).result.output).toBe('a,b{color:red}');
    expect(evaluate('a { color: red } b { color: red }', false).result.output).toBe('a{color:red}b{color:red}');
  });

  it('keeps licence comments', () => {
    expect(evaluate('/*! keep */ a { color: red }', true).result.output).toContain('/*! keep */');
  });

  it('measures the saving', () => {
    const { result } = evaluate('a { color: red }', true);
    expect(result.before).toBe(16);
    expect(result.after).toBe(12);
    expect(result.saved).toBe(4);
  });

  it('warns about CSS that could not be read', () => {
    const { result } = evaluate('a { color red; } b { color: blue }', true);
    expect(result.problems.length).toBeGreaterThan(0);
    expect(describeProblems(result)).toContain('line 1');
    expect(describeProblems(evaluate('a { color: red }', true).result)).toBeNull();
  });

  it('has nothing for blank text', () => {
    expect(evaluate(' ', true)).toEqual({ error: null, result: null });
  });

  it('builds the report', () => {
    const report = buildReport(evaluate('a { color: red }', false).result, false);
    expect(report.inputs[0].value).toBe('No');
    expect(report.results[1].value).toBe('12 bytes');
    expect(report.text.mono).toBe(true);
    expect(report.notes).toBeNull();
  });
});
