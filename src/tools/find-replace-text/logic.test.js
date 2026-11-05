import { describe, expect, it } from 'vitest';
import { buildReport, replaceText, validate } from './logic.js';

describe('replaceText', () => {
  it('replaces every match, ignoring case by default', () => {
    expect(replaceText({ text: 'Apple apple', find: 'apple', replacement: 'pear' })).toEqual({ output: 'pear pear', count: 2 });
  });

  it('can match case', () => {
    expect(replaceText({ text: 'Apple apple', find: 'apple', replacement: 'pear', caseSensitive: true })).toEqual({ output: 'Apple pear', count: 1 });
  });

  it('can match whole words, in any language', () => {
    expect(replaceText({ text: 'cat category cat_x', find: 'cat', replacement: 'dog', wholeWord: true }).output).toBe('dog category cat_x');
    expect(replaceText({ text: 'été étés', find: 'été', replacement: 'x', wholeWord: true }).output).toBe('x étés');
  });

  it('treats symbols literally in a plain search', () => {
    expect(replaceText({ text: 'a.b axb', find: 'a.b', replacement: 'z' })).toEqual({ output: 'z axb', count: 1 });
    expect(replaceText({ text: '(x)', find: '(x)', replacement: '[y]' }).output).toBe('[y]');
  });

  it('keeps dollar signs literal in a plain replacement', () => {
    expect(replaceText({ text: 'price', find: 'price', replacement: '$1 and $&' }).output).toBe('$1 and $&');
  });

  it('can delete matches', () => {
    expect(replaceText({ text: 'very very good', find: 'very ' }).output).toBe('good');
  });

  it('reports no matches', () => {
    expect(replaceText({ text: 'abc', find: 'z', replacement: 'y' })).toEqual({ output: 'abc', count: 0 });
  });

  it('supports regular expressions with groups', () => {
    expect(replaceText({ text: 'one two', find: '(\\w+) (\\w+)', replacement: '$2 $1', useRegex: true })).toEqual({ output: 'two one', count: 1 });
    expect(replaceText({ text: 'a\nb', find: '^', replacement: '- ', useRegex: true }).output).toBe('- a\n- b');
  });

  it('explains an invalid pattern, without throwing', () => {
    expect(replaceText({ text: 'a', find: '(', useRegex: true }).error).toContain('not a valid pattern');
  });
});

describe('validate', () => {
  it('requires text and a search', () => {
    expect(validate({ text: '', find: '' })).toEqual({ text: 'Please enter your text.', find: 'Please enter what to find.' });
    expect(validate({ text: 'a', find: 'b' })).toEqual({});
  });
});

describe('buildReport', () => {
  it('shows an empty replacement clearly', () => {
    const report = buildReport({ output: 'x', count: 1 }, { find: 'a', replacement: '', caseSensitive: false, wholeWord: true, useRegex: false });
    expect(report.inputs[1].value).toBe('(nothing)');
    expect(report.inputs[3].value).toBe('Yes');
    expect(report.results[0].label).toBe('Replacement made');
  });
});
