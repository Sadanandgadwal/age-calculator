import ToolCard from './ToolCard.jsx';

export default function ToolGrid({ tools, headingLevel }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={tool.id}>
          <ToolCard tool={tool} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
