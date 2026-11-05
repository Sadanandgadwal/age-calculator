import { useState } from 'react';
import { FileCode } from 'lucide-react';
import * as content from './content.js';
import { blockedNote, buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import TextToolShell, { TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

const previewClass =
  'break-words [&_a]:text-primary [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-page [&_code]:px-1 [&_code]:font-mono [&_code]:text-sm [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-extrabold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-bold [&_h4]:mt-3 [&_h4]:font-bold [&_hr]:my-4 [&_hr]:border-line [&_img]:max-w-full [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-page [&_pre]:p-3 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-line [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-line [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6';

function Preview({ html }) {
  return <div className={previewClass} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function MarkdownPreviewPage() {
  const [text, setText] = useState('');
  const result = evaluate(text);
  const note = result && blockedNote(result);

  return (
    <ToolLayout toolId="markdown-preview" content={content}>
      <TextToolShell
        formLabel="Enter your Markdown"
        onClear={() => setText('')}
        panel={{ title: 'Preview', icon: FileCode, emptyText: 'Type or paste Markdown to see how it will look.' }}
        results={
          result && (
            <>
              {note && <p className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{note}</p>}
              <div tabIndex={0} role="region" aria-label="Markdown preview" className="mt-5 max-h-[32rem] overflow-auto rounded-xl border-2 border-line px-4 py-2 outline-none focus-visible:ring-3 focus-visible:ring-mint">
                <Preview html={result.html} />
              </div>
              <ResultActions getText={() => result.html} getReport={() => buildReport(result, <Preview html={result.html} />)} />
            </>
          )
        }
      >
        <TextField id="markdown-text" label="Your Markdown" rows={14} value={text} onChange={setText} className="font-mono" />
      </TextToolShell>
    </ToolLayout>
  );
}
