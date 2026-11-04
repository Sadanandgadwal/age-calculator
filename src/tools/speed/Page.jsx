import * as content from './content.js';
import { SPEED_UNITS } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function SpeedConverterPage() {
  return (
    <ToolLayout toolId="speed-converter" content={content}>
      <UnitConverter units={SPEED_UNITS} defaultFrom="kmh" defaultTo="mph" resetsUnits />
    </ToolLayout>
  );
}
