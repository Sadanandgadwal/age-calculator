import { siteConfig } from '../config/site.js';
import { CATEGORIES } from '../data/toolCategories.js';
import { TOOLS } from '../data/toolsRegistry.js';
import { absoluteUrl } from './pageMeta.js';

const link = (name, path, description) => `- [${name}](${absoluteUrl(path)})${description ? `: ${description}` : ''}`;

/** A Markdown summary of the site for AI tools, served as /llms.txt. */
export function buildLlmsText() {
  const sections = CATEGORIES.map((category) => {
    const tools = TOOLS.filter(({ categories }) => categories[0] === category.id);
    if (tools.length === 0) return null;
    return [`## ${category.name}`, '', ...tools.map(({ name, route, description }) => link(name, route, description))].join('\n');
  }).filter(Boolean);

  return [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.tagline} No sign-up is needed, and the tools run in the browser, so files and entries stay on the device.`,
    '',
    ...sections.flatMap((section) => [section, '']),
    '## Optional',
    '',
    link('All tools', '/all-tools'),
    link('About', '/about'),
    link('Privacy Policy', '/privacy.html'),
    '',
  ].join('\n');
}
