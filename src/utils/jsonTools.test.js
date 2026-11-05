import { describe, expect, it } from 'vitest';
import { getTreeStats, parseJson, printTree } from './jsonTools.js';

const tree = (text) => parseJson(text).tree;

describe('parseJson', () => {
  it.each(['{}', '[]', '1', '"a"', 'true', 'null', ' { "a" : [ 1 , { "b" : null } ] } ', '-1.5e10', '"a\\"b\\\\"'])('accepts %s', (text) => {
    expect(parseJson(text).tree).toBeTruthy();
  });

  it.each(['', '{', '{a:1}', "{'a':1}", '[1,]', '{"a":1,}', 'undefined', '1 2'])('rejects %j', (text) => {
    expect(parseJson(text).error.message).toBeTruthy();
  });

  it('finds where the error is', () => {
    const { error } = parseJson('{\n  "a": 1,\n  b: 2\n}');
    expect(error.line).toBe(3);
    expect(error.column).toBe(3);
    expect(error.message).toContain('Line 3, column 3');
  });

  it('copes with extreme nesting, without throwing', () => {
    const deep = `${'['.repeat(200000)}${']'.repeat(200000)}`;
    expect(() => parseJson(deep)).not.toThrow();
  });
});

describe('printTree', () => {
  const source = '{"b":[1,{"c":null}],"a":"x","e":{},"f":[]}';

  it('minifies', () => {
    expect(printTree(tree(' { "a" : [ 1 , 2 ] } '))).toBe('{"a":[1,2]}');
  });

  it('formats with the chosen indent', () => {
    expect(printTree(tree('{"a":[1]}'), { indent: '  ' })).toBe('{\n  "a": [\n    1\n  ]\n}');
    expect(printTree(tree('{"a":1}'), { indent: '\t' })).toBe('{\n\t"a": 1\n}');
  });

  it('keeps empty containers on one line', () => {
    expect(printTree(tree('{"a":{},"b":[]}'), { indent: '  ' })).toBe('{\n  "a": {},\n  "b": []\n}');
  });

  it('can sort keys at every level, leaving arrays in order', () => {
    expect(printTree(tree('{"b":1,"a":{"d":1,"c":2},"e":[2,1]}'), { sortKeys: true })).toBe('{"a":{"c":2,"d":1},"b":1,"e":[2,1]}');
  });

  it('keeps the exact data that JSON.parse would change', () => {
    const exact = '{"big":12345678901234567890,"small":1.10,"esc":"\\u00e9","dup":1,"dup":2}';
    expect(printTree(tree(exact))).toBe(exact);
  });

  it('round trips to the same data', () => {
    expect(JSON.parse(printTree(tree(source), { indent: '  ' }))).toEqual(JSON.parse(source));
  });

  it('leaves spaces and symbols in strings alone', () => {
    expect(printTree(tree('{ "a b" : "c , d } ]" }'))).toBe('{"a b":"c , d } ]"}');
  });
});

describe('getTreeStats', () => {
  it('counts the structure', () => {
    expect(getTreeStats(tree('{"a":[1,"x",true,null],"b":{"c":2}}'))).toEqual({
      objects: 2,
      arrays: 1,
      keys: 3,
      strings: 1,
      numbers: 2,
      booleans: 1,
      nulls: 1,
      depth: 3,
      duplicateKeys: 0,
    });
  });

  it('finds repeated keys', () => {
    expect(getTreeStats(tree('{"a":1,"a":2,"\\u0061":3}')).duplicateKeys).toBe(2);
  });
});
