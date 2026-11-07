import * as content from './content.js';
import BasePairConverter from '../../components/common/BasePairConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

const MODES = [
  { id: 'to-hex', name: 'Decimal to hex', from: 10, to: 16 },
  { id: 'from-hex', name: 'Hex to decimal', from: 16, to: 10 },
];

export default function DecimalToHexPage() {
  return (
    <ToolLayout toolId="decimal-to-hex-converter" content={content}>
      <BasePairConverter modes={MODES} idPrefix="hex" />
    </ToolLayout>
  );
}
