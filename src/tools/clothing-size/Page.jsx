import { Shirt } from 'lucide-react';
import * as content from './content.js';
import { CHARTS, DEFAULTS, NOTE } from './logic.js';
import SizeChartConverter from '../../components/common/SizeChartConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function ClothingSizeConverterPage() {
  return (
    <ToolLayout toolId="clothing-size-converter" content={content}>
      <SizeChartConverter charts={CHARTS} idPrefix="clothing" icon={Shirt} note={NOTE} defaults={DEFAULTS} />
    </ToolLayout>
  );
}
