import { useState } from 'react';
import { File } from 'lucide-react';
import * as content from './content.js';
import { DPIS, GROUPS, ORIENTATIONS, PAPERS, buildReport, buildResultText, getRows, measure, titleOf } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

const DPI_OPTIONS = DPIS.map((dpi) => ({ id: dpi, name: `${dpi} DPI` }));

export default function PaperSizeConverterPage() {
  const [paperId, setPaperId] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [dpi, setDpi] = useState('300');
  const result = measure(paperId, orientation, Number(dpi));
  const rows = getRows(result);

  const reset = () => {
    setPaperId('a4');
    setOrientation('portrait');
    setDpi('300');
  };

  return (
    <ToolLayout toolId="paper-size-converter" content={content}>
      <TextToolShell
        formLabel="Choose a paper size"
        onClear={reset}
        panel={{ title: titleOf(result), icon: File }}
        results={
          <>
            <div className="mt-5">
              <ResultCard label={rows[0].label} value={rows[0].value} icon={File} />
            </div>
            <ResultDetails items={rows.slice(1)} />
            <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
          </>
        }
      >
        <div>
          <label htmlFor="paper-size" className="block text-sm font-bold text-ink">
            Paper size
          </label>
          <select
            id="paper-size"
            value={paperId}
            onChange={(event) => setPaperId(event.target.value)}
            className="mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint"
          >
            {GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {PAPERS.filter((paper) => paper.group === group).map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <SegmentedControl label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />
        <SegmentedControl label="Resolution" options={DPI_OPTIONS} value={dpi} onChange={setDpi} />
      </TextToolShell>
    </ToolLayout>
  );
}
