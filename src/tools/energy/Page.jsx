import * as content from './content.js';
import { ENERGY_UNITS } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function EnergyConverterPage() {
  return (
    <ToolLayout toolId="energy-converter" content={content}>
      <UnitConverter units={ENERGY_UNITS} defaultFrom="kcal" defaultTo="j" resetsUnits />
    </ToolLayout>
  );
}
