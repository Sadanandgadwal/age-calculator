import { useState } from 'react';
import { Link2 } from 'lucide-react';
import * as content from './content.js';
import { SEPARATORS, buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function SlugGeneratorPage() {
  const [text, setText] = useState('');
  const [separator, setSeparator] = useState(SEPARATORS[0].id);
  const [keepCase, setKeepCase] = useState(false);
  const result = evaluate(text, separator, keepCase);

  return (
    <ToolLayout toolId="slug-generator" content={content}>
      <TextToolShell
        formLabel="Enter your title"
        onClear={() => setText('')}
        panel={{ title: 'Your Slug', icon: Link2, emptyText: 'Type a title to turn it into a slug.' }}
        results={
          result &&
          (result.slug ? (
            <>
              <TextOutput value={result.slug} />
              <ResultActions getText={() => result.slug} getReport={() => buildReport(text, separator, keepCase, result.slug)} />
            </>
          ) : (
            <p className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">This text has no letters or numbers to use in a slug.</p>
          ))
        }
      >
        <TextField id="slug-text" label="Title or text" rows={4} value={text} onChange={setText} />
        <SegmentedControl label="Separator" options={SEPARATORS} value={separator} onChange={setSeparator} />
        <CheckField label="Keep capital letters" checked={keepCase} onChange={setKeepCase} />
      </TextToolShell>
    </ToolLayout>
  );
}
