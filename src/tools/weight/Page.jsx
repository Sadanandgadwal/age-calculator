import * as content from './content.js';
import { WEIGHT_UNITS } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function WeightConverterPage() {
  return (
    <ToolLayout toolId="kg-to-gram-converter" content={content}>
      <UnitConverter units={WEIGHT_UNITS} defaultFrom="kg" defaultTo="g" />
    </ToolLayout>
  );
}
