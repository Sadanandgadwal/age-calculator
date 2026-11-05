import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import * as content from './content.js';
import { DEFAULTS, OPTIONS, estimateStrength, generatePassword, validate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import { CheckField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

export default function PasswordGeneratorPage() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const form = useCalculatorForm();

  const set = (name) => (value) => setSettings((current) => ({ ...current, [name]: value }));

  const submit = (event) => {
    const { errors: nextErrors, length } = validate(settings);
    const isValid = Object.keys(nextErrors).length === 0;
    setErrors(nextErrors);
    setResult(isValid ? { password: generatePassword(settings, length), strength: estimateStrength(settings, length) } : null);
    form.submit(event);
  };

  const reset = () => {
    setSettings(DEFAULTS);
    setErrors({});
    setResult(null);
    form.clear();
  };

  return (
    <ToolLayout toolId="password-generator" content={content}>
      <CalculatorShell
        form={{ ...form, submit }}
        formLabel="Choose your password settings"
        onReset={reset}
        submitLabel="Generate"
        panel={{ title: 'Your Password', icon: KeyRound, emptyText: 'Choose your settings and select Generate to create a password.' }}
        results={
          result && (
            <div className="print:hidden">
              <TextOutput value={result.password} className="font-mono text-base" />
              <div className="mt-4">
                <ResultCard label={`${result.strength.bits} bits of randomness`} value={result.strength.label} icon={ShieldCheck} />
              </div>
              <ResultActions copyOnly getText={() => result.password} />
            </div>
          )
        }
      >
        <CalculatorInput id="password-length" label="Length" inputMode="numeric" value={settings.length} onChange={set('length')} error={errors.length} />
        <div>
          {OPTIONS.map(({ id, label }) => (
            <CheckField key={id} label={label} checked={settings[id]} onChange={set(id)} />
          ))}
          <CheckField label="Skip look-alike characters (O, 0, I, l, 1)" checked={settings.skipLookAlike} onChange={set('skipLookAlike')} />
          {errors.options && <p className="mt-1.5 text-sm font-medium text-danger">{errors.options}</p>}
        </div>
      </CalculatorShell>
    </ToolLayout>
  );
}
