import { describe, expect, it } from 'vitest';
import { getFeaturedTools, getRecentTools, getRelatedTools, getToolsInCategory, searchTools } from './toolSearch.js';

const tool = (id, overrides = {}) => ({
  id,
  name: id,
  description: '',
  keywords: [],
  categories: ['calculators'],
  featured: false,
  addedOn: '2026-01-01',
  ...overrides,
});

const TOOLS = [
  tool('Date Calculator', { categories: ['date-time'], keywords: ['days between'], addedOn: '2026-03-01' }),
  tool('Age Calculator', {
    categories: ['calculators', 'date-time'],
    description: 'Find your exact age',
    keywords: ['birthday', 'dob'],
    featured: true,
    addedOn: '2026-01-15',
  }),
  tool('Weight Converter', { categories: ['converters'], keywords: ['kg', 'gram'], addedOn: '2026-02-01' }),
  tool('GST Calculator', { categories: ['finance'], description: 'Mentions age calculator tax' }),
];
const ids = (tools) => tools.map(({ id }) => id);

describe('searchTools', () => {
  it('returns every tool for an empty or blank query', () => {
    expect(searchTools(TOOLS, '')).toEqual(TOOLS);
    expect(searchTools(TOOLS, '   ')).toEqual(TOOLS);
  });

  it('searches by name, ignoring case and outer spaces', () => {
    expect(ids(searchTools(TOOLS, '  WEIGHT '))).toEqual(['Weight Converter']);
  });

  it('searches by keyword', () => {
    expect(ids(searchTools(TOOLS, 'dob'))).toEqual(['Age Calculator']);
  });

  it('searches by category name', () => {
    expect(ids(searchTools(TOOLS, 'converters'))).toEqual(['Weight Converter']);
    expect(ids(searchTools(TOOLS, 'finance'))).toEqual(['GST Calculator']);
    expect(ids(searchTools(TOOLS, 'date & time'))).toEqual(['Date Calculator', 'Age Calculator']);
  });

  it('requires every word to match, in any order', () => {
    expect(ids(searchTools(TOOLS, 'gram weight'))).toEqual(['Weight Converter']);
    expect(searchTools(TOOLS, 'weight birthday')).toEqual([]);
  });

  it('puts name matches ahead of other matches', () => {
    expect(ids(searchTools(TOOLS, 'age calculator'))).toEqual(['Age Calculator', 'GST Calculator']);
  });

  it('returns nothing when no tool matches', () => {
    expect(searchTools(TOOLS, 'zzz')).toEqual([]);
  });
});

describe('tool listings', () => {
  it('includes a tool in each of its categories', () => {
    expect(ids(getToolsInCategory(TOOLS, 'date-time'))).toEqual(['Date Calculator', 'Age Calculator']);
    expect(ids(getToolsInCategory(TOOLS, 'calculators'))).toEqual(['Age Calculator']);
    expect(getToolsInCategory(TOOLS, 'missing')).toEqual([]);
  });

  it('treats later registry entries as newer when added on the same day', () => {
    const sameDay = [tool('First', { addedOn: '2026-01-01' }), tool('Second', { addedOn: '2026-01-01' })];
    expect(ids(getRecentTools(sameDay))).toEqual(['Second', 'First']);
  });

  it('lists related tools, sharing a category first, excluding the tool itself', () => {
    const age = TOOLS[1];
    expect(ids(getRelatedTools(TOOLS, age))).toEqual(['Date Calculator', 'Weight Converter', 'GST Calculator']);
    expect(ids(getRelatedTools(TOOLS, age, 1))).toEqual(['Date Calculator']);
  });

  it('lists featured tools', () => {
    expect(ids(getFeaturedTools(TOOLS))).toEqual(['Age Calculator']);
  });

  it('lists recent tools newest first, up to the limit, without reordering the source', () => {
    const original = [...TOOLS];
    expect(ids(getRecentTools(TOOLS, 2))).toEqual(['Date Calculator', 'Weight Converter']);
    expect(TOOLS).toEqual(original);
  });
});
