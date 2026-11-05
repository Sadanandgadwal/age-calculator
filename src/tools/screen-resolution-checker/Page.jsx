import { useSyncExternalStore } from 'react';
import { AppWindow, Monitor, ScanLine } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, describeDisplay, readDisplay } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

function subscribe(onChange) {
  window.addEventListener('resize', onChange);
  window.addEventListener('orientationchange', onChange);
  return () => {
    window.removeEventListener('resize', onChange);
    window.removeEventListener('orientationchange', onChange);
  };
}

const getSnapshot = () => JSON.stringify(readDisplay());
const getServerSnapshot = () => null;

export default function ScreenResolutionCheckerPage() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const display = snapshot && describeDisplay(JSON.parse(snapshot));

  return (
    <ToolLayout toolId="screen-resolution-checker" content={content}>
      <ResultPanel title="Your Display" icon={Monitor} emptyText="Your display details appear once the page has loaded.">
        {display ? (
          <>
            <p aria-live="polite" className="sr-only">
              Window {display.window}
            </p>
            <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
              <ResultCard label="Screen Resolution" value={display.screen} icon={Monitor} />
              <ResultCard label="Browser Window" value={display.window} icon={AppWindow} tone="yellow" />
              <ResultCard label="Pixel Ratio" value={display.pixelRatio} icon={ScanLine} tone="lavender" />
            </div>
            <ResultDetails items={display.details} />
            <ResultActions getText={() => buildResultText(display)} getReport={() => buildReport(display)} />
          </>
        ) : undefined}
      </ResultPanel>
    </ToolLayout>
  );
}
