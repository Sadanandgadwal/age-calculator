import { describe, expect, it } from 'vitest';
import { DIALECTS, buildReport, evaluate } from './logic.js';

describe('SQL Formatter', () => {
  it('formats a query', () => {
    expect(evaluate('select a,b from t where x=1', 'sql', true).output).toBe('SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  x = 1');
  });

  it('can keep the keyword case', () => {
    expect(evaluate('select a from t', 'sql', false).output).toBe('select\n  a\nfrom\n  t');
  });

  it('understands each dialect', () => {
    expect(evaluate('select `a` from `t`', 'mysql', true).output).toContain('`a`');
    expect(evaluate('select [a] from [t]', 'transactsql', true).output).toContain('[a]');
    expect(evaluate('select a::int from t', 'postgresql', true).output).toContain('::');
    for (const { id } of DIALECTS) expect(evaluate('select 1', id, true).output, id).toBe('SELECT\n  1');
  });

  it('only reads a dangerous query, as text', () => {
    expect(evaluate("delete from users where name = 'x'; drop table users", 'sql', true).output).toContain('DROP TABLE');
  });

  it('explains what it cannot read', () => {
    const { error, output } = evaluate("select 'unterminated", 'sql', true);
    expect(error).toContain('Parse error');
    expect(error).not.toContain('\n');
    expect(output).toBeNull();
  });

  it('has nothing for blank text', () => {
    expect(evaluate(' ', 'sql', true)).toEqual({ error: null, output: null });
  });

  it('builds the report', () => {
    const report = buildReport('SELECT\n  1', 'mysql', false);
    expect(report.inputs).toEqual([{ label: 'Dialect', value: 'MySQL' }, { label: 'Uppercase keywords', value: 'No' }]);
    expect(report.text.mono).toBe(true);
  });
});
