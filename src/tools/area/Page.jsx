import * as content from './content.js';
import { AREA_UNITS } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function AreaConverterPage() {
  return (
    <ToolLayout toolId="area-converter" content={content}>
      <UnitConverter units={AREA_UNITS} defaultFrom="sqft" defaultTo="sqm" resetsUnits />
    </ToolLayout>
  );
}
