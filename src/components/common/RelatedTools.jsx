import ToolGrid from './ToolGrid.jsx';
import { TOOLS, getToolById } from '../../data/toolsRegistry.js';
import { getRelatedTools } from '../../utils/toolSearch.js';

export default function RelatedTools({ toolId }) {
  const related = getRelatedTools(TOOLS, getToolById(toolId));
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-tools-heading" className="mt-12 print:hidden">
      <h2 id="related-tools-heading" className="mb-5 text-2xl font-extrabold tracking-tight">
        Related tools
      </h2>
      <ToolGrid tools={related} />
    </section>
  );
}
