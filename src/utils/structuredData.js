/**
 * FAQPage data for search engines, built from the same copy the page displays.
 * Structured data has to match visible content, so it is never written separately.
 */
export function buildFaqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/** Serialises data for a script tag. Escaping "<" stops the content from closing the tag early. */
export function toJsonLdScript(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}
