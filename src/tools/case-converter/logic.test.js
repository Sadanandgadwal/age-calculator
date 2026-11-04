import { describe, expect, it } from 'vitest';
import { buildReport, evaluate } from './logic.js';

describe('Case Converter', () => {
  it.each([
    ['upper', 'Hello wörld', 'HELLO WÖRLD'],
    ['lower', 'Hello WÖRLD', 'hello wörld'],
    ['title', 'the QUICK brown-fox', 'The Quick Brown-Fox'],
    ['title', "don't stop\nnow", "Don't Stop\nNow"],
    ['sentence', 'HELLO THERE. HOW ARE YOU?\nFINE!', 'Hello there. How are you?\nFine!'],
    ['camel', 'user first name', 'userFirstName'],
    ['camel', 'User_first-name', 'userFirstName'],
    ['snake', 'userFirstName', 'user_first_name'],
    ['snake', "Don't stop, now!", 'dont_stop_now'],
    ['kebab', 'Hello big World', 'hello-big-world'],
    ['kebab', 'one two\nthree four', 'one-two\nthree-four'],
  ])('%s converts %j', (mode, text, expected) => {
    expect(evaluate(mode, text)).toBe(expected);
  });

  it('has no result for blank text', () => {
    expect(evaluate('upper', '  \n')).toBeNull();
  });

  it('builds the report', () => {
    const report = buildReport('camel', 'helloWorld');
    expect(report.inputs[0].value).toBe('camelCase');
    expect(report.text.value).toBe('helloWorld');
  });
});
