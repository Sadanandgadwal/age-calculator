import * as content from './content.js';
import { TIME_UNITS, getYearDetails } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function TimeUnitConverterPage() {
  return (
    <ToolLayout toolId="time-unit-converter" content={content}>
      <UnitConverter units={TIME_UNITS} defaultFrom="h" defaultTo="min" getExtraDetails={getYearDetails} resetsUnits />
    </ToolLayout>
  );
}
