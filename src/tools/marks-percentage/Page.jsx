import { useState } from 'react';
import * as content from './content.js';
import GradeScale from './GradeScale.jsx';
import { scaleRows, validateScale } from './logic.js';
import OverallMode from './OverallMode.jsx';
import SubjectMode from './SubjectMode.jsx';
import TargetMode from './TargetMode.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

const MODES = [
  { id: 'subjects', name: 'Subject-wise' },
  { id: 'overall', name: 'Overall' },
  { id: 'target', name: 'Target' },
];

export default function MarksPercentagePage() {
  const [mode, setMode] = useState('subjects');
  const [scaleId, setScaleId] = useState('standard');
  const [gradeRows, setGradeRows] = useState(() => scaleRows('standard'));
  const { isValid } = validateScale(gradeRows);

  return (
    <ToolLayout toolId="marks-percentage-calculator" content={content}>
      <div className="mb-6">
        <SegmentedControl label="Calculation mode" options={MODES} value={mode} onChange={setMode} />
      </div>
      <div hidden={mode !== 'subjects'}>
        <SubjectMode gradeRows={gradeRows} isScaleValid={isValid} />
      </div>
      <div hidden={mode !== 'overall'}>
        <OverallMode gradeRows={gradeRows} isScaleValid={isValid} />
      </div>
      <div hidden={mode !== 'target'}>
        <TargetMode />
      </div>
      {mode !== 'target' && (
        <GradeScale
          scaleId={scaleId}
          rows={gradeRows}
          onChange={(nextScaleId, rows) => {
            setScaleId(nextScaleId);
            setGradeRows(rows);
          }}
        />
      )}
    </ToolLayout>
  );
}
