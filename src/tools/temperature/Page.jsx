import * as content from './content.js';
import { TEMPERATURE_UNITS, evaluateTemperature } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function TemperatureConverterPage() {
  return (
    <ToolLayout toolId="temperature-converter" content={content}>
      <UnitConverter units={TEMPERATURE_UNITS} defaultFrom="c" defaultTo="f" evaluate={evaluateTemperature} resetsUnits />
    </ToolLayout>
  );
}
