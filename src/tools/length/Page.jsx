import * as content from './content.js';
import { LENGTH_UNITS, getFeetAndInchesDetails } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function LengthConverterPage() {
  return (
    <ToolLayout toolId="cm-to-feet-converter" content={content}>
      <UnitConverter units={LENGTH_UNITS} defaultFrom="cm" defaultTo="ft" getExtraDetails={getFeetAndInchesDetails} />
    </ToolLayout>
  );
}
