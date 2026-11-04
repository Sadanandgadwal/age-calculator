import * as content from './content.js';
import { VOLUME_UNITS } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function VolumeConverterPage() {
  return (
    <ToolLayout toolId="volume-converter" content={content}>
      <UnitConverter units={VOLUME_UNITS} defaultFrom="l" defaultTo="usgal" resetsUnits />
    </ToolLayout>
  );
}
