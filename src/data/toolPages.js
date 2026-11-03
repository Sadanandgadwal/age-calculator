import { lazy } from 'react';
import { TOOLS, getToolByRoute } from './toolsRegistry.js';

const lazyPages = new Map(TOOLS.map((tool) => [tool.id, lazy(tool.load)]));
const loadedPages = new Map();

/**
 * Loads a tool's page before the first render. Without this, the prerendered page
 * would be replaced by a loading state while the tool's code downloads.
 */
export async function preloadToolPage(pathname) {
  const tool = getToolByRoute(pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname);
  if (tool) loadedPages.set(tool.id, (await tool.load()).default);
}

export const getToolPage = (tool) => loadedPages.get(tool.id) ?? lazyPages.get(tool.id);
