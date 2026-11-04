import * as content from './content.js';
import { STORAGE_UNITS, evaluateStorage } from './logic.js';
import UnitConverter from '../../components/common/UnitConverter.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function DataStorageConverterPage() {
  return (
    <ToolLayout toolId="data-storage-converter" content={content}>
      <UnitConverter units={STORAGE_UNITS} defaultFrom="gb" defaultTo="mb" evaluate={evaluateStorage} resetsUnits />
    </ToolLayout>
  );
}
