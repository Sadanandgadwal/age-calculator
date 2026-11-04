import { getCategory } from '../data/toolCategories.js';

const normalize = (text) => text.trim().toLowerCase();

function searchableText(tool) {
  const categoryNames = tool.categories.map((id) => getCategory(id)?.name ?? id);
  return normalize([tool.name, tool.description, ...tool.keywords, ...categoryNames].join(' '));
}

/**
 * Finds tools matching every word of the query, across names, descriptions,
 * keywords and categories. Tools with a matching name come first.
 */
export function searchTools(tools, query) {
  const search = normalize(query);
  if (!search) return tools;

  const words = search.split(/\s+/);
  const matches = tools.filter((tool) => {
    const text = searchableText(tool);
    return words.every((word) => text.includes(word));
  });

  const nameMatches = (tool) => normalize(tool.name).includes(search);
  return [...matches.filter(nameMatches), ...matches.filter((tool) => !nameMatches(tool))];
}

export const getToolsInCategory = (tools, categoryId) =>
  tools.filter((tool) => tool.categories.includes(categoryId));

export function getRelatedTools(tools, tool, limit = 3) {
  const others = tools.filter(({ id }) => id !== tool.id);
  const sharesCategory = ({ categories }) => categories.some((id) => tool.categories.includes(id));
  return [...others.filter(sharesCategory), ...others.filter((other) => !sharesCategory(other))].slice(0, limit);
}

export const getFeaturedTools = (tools) => tools.filter((tool) => tool.featured);

export const getRecentTools = (tools, limit = 3) =>
  [...tools].reverse().sort((a, b) => b.addedOn.localeCompare(a.addedOn)).slice(0, limit);
