import * as content from './content.js';
import { PRESSURE_UNITS } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function PressureConverterPage() {
  return (
    <ToolLayout toolId="pressure-converter" content={content}>
      <UnitConverter units={PRESSURE_UNITS} defaultFrom="psi" defaultTo="bar" resetsUnits />
    </ToolLayout>
  );
}
