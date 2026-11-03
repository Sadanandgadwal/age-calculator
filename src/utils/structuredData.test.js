import { describe, expect, it } from 'vitest';
import { FAQS, USEFUL_INFO } from '../content/faqs.js';
import { buildFaqSchema, toJsonLdScript } from './structuredData.js';

describe('buildFaqSchema', () => {
  it('includes every question shown on the page, word for word', () => {
    const items = [...USEFUL_INFO, ...FAQS];
    const schema = buildFaqSchema(items);

    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(items.length);
    expect(schema.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: items[0].question,
      acceptedAnswer: { '@type': 'Answer', text: items[0].answer },
    });
  });
});

describe('toJsonLdScript', () => {
  it('produces parseable JSON that cannot close the script tag', () => {
    const script = toJsonLdScript({ text: '</script><b>"quoted"</b>' });
    const body = script.slice(script.indexOf('>') + 1, script.lastIndexOf('</script>'));

    expect(body).not.toContain('<');
    expect(JSON.parse(body)).toEqual({ text: '</script><b>"quoted"</b>' });
  });
});
