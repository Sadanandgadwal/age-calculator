import * as content from './content.js';
import BasePairConverter from '../../components/common/BasePairConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

const MODES = [
  { id: 'to-decimal', name: 'Binary to decimal', from: 2, to: 10 },
  { id: 'from-decimal', name: 'Decimal to binary', from: 10, to: 2 },
];

export default function BinaryToDecimalPage() {
  return (
    <ToolLayout toolId="binary-to-decimal-converter" content={content}>
      <BasePairConverter modes={MODES} idPrefix="binary" />
    </ToolLayout>
  );
}
