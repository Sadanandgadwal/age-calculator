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

export const getActiveCategories = (categories, tools) =>
  categories.filter(({ id }) => getToolsInCategory(tools, id).length > 0);

export function getRelatedTools(tools, tool, limit = 3) {
  const rank = ({ categories }) => {
    if (categories[0] === tool.categories[0]) return 0;
    if (tool.categories.includes(categories[0]) && categories.includes(tool.categories[0])) return 0;
    return categories.some((id) => tool.categories.includes(id)) ? 1 : 2;
  };
  const start = tools.findIndex(({ id }) => id === tool.id);
  const distance = (other) => (tools.indexOf(other) - start + tools.length) % tools.length;
  const sorted = tools.filter(({ id }) => id !== tool.id).sort((a, b) => rank(a) - rank(b) || distance(a) - distance(b));
  const closest = sorted.filter((other) => rank(other) === 0);
  const previous = closest.length > limit ? closest.at(-1) : null;
  if (!previous) return sorted.slice(0, limit);
  return [...sorted.filter((other) => other !== previous).slice(0, limit - 1), previous];
}

export const getFeaturedTools = (tools) => tools.filter((tool) => tool.featured);

export const getRecentTools = (tools, limit = 3) =>
  [...tools].reverse().sort((a, b) => b.addedOn.localeCompare(a.addedOn)).slice(0, limit);
