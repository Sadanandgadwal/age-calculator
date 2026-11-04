import * as content from './content.js';
import { ANGLE_UNITS, evaluateAngle } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function AngleConverterPage() {
  return (
    <ToolLayout toolId="angle-converter" content={content}>
      <UnitConverter units={ANGLE_UNITS} defaultFrom="deg" defaultTo="rad" evaluate={evaluateAngle} resetsUnits />
    </ToolLayout>
  );
}
