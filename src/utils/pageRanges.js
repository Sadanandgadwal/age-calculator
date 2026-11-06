const PART = /^(\d*)\s*(?:(-)\s*(\d*))?$/;

export function parsePageRanges(text, pageCount) {
  const parts = text.split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return { error: 'Please enter the pages, such as 1-3, 5.' };
  const pages = [];
  const seen = new Set();
  for (const part of parts) {
    const match = part.match(PART);
    if (!match || (!match[1] && !match[3])) return { error: `"${part}" is not a page or range. Use numbers such as 4 or 2-6.` };
    const start = match[1] ? Number(match[1]) : 1;
    const end = match[2] ? (match[3] ? Number(match[3]) : pageCount) : start;
    if (start < 1 || end < 1) return { error: 'Page numbers start at 1.' };
    if (start > end) return { error: `In "${part}", the first page is after the last.` };
    if (end > pageCount) return { error: `Page ${end} does not exist. This PDF has ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}.` };
    for (let page = start; page <= end; page += 1) {
      if (!seen.has(page)) {
        seen.add(page);
        pages.push(page - 1);
      }
    }
  }
  return { pages };
}

export function formatPageRanges(indexes) {
  const sorted = [...new Set(indexes)].sort((first, second) => first - second);
  const ranges = [];
  for (const index of sorted) {
    const last = ranges.at(-1);
    if (last && index === last[1] + 1) last[1] = index;
    else ranges.push([index, index]);
  }
  return ranges.map(([start, end]) => (start === end ? `${start + 1}` : `${start + 1}-${end + 1}`)).join(', ');
}

export function groupsOf(pageCount, size) {
  const groups = [];
  for (let start = 0; start < pageCount; start += size) groups.push(Array.from({ length: Math.min(size, pageCount - start) }, (_, offset) => start + offset));
  return groups;
}
