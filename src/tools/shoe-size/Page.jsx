import { Footprints } from 'lucide-react';
import * as content from './content.js';
import { CHARTS, DEFAULTS, NOTE } from './logic.js';
import SizeChartConverter from '../../components/common/SizeChartConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function ShoeSizeConverterPage() {
  return (
    <ToolLayout toolId="shoe-size-converter" content={content}>
      <SizeChartConverter charts={CHARTS} idPrefix="shoe" icon={Footprints} note={NOTE} defaults={DEFAULTS} />
    </ToolLayout>
  );
}
