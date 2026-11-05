import * as content from './content.js';
import { FREQUENCY_UNITS } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function FrequencyConverterPage() {
  return (
    <ToolLayout toolId="frequency-converter" content={content}>
      <UnitConverter units={FREQUENCY_UNITS} defaultFrom="ghz" defaultTo="mhz" resetsUnits />
    </ToolLayout>
  );
}
