import { useEffect, useState } from 'react';
import { ArrowUpDown, Coins, RefreshCw } from 'lucide-react';
import * as content from './content.js';
import { CODES, FETCH_ERROR, NOTE, buildReport, buildResultText, currencyName, evaluate, fetchRate, formatMoney, getRows, summary } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

const selectClass =
  'mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint';
const actionButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-line bg-white px-5 font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';

function CurrencySelect({ id, label, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>
        {CODES.map((code) => (
          <option key={code} value={code}>
            {code} – {currencyName(code)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState('INR');
  const [to, setTo] = useState('USD');
  const [manual, setManual] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [live, setLive] = useState({ key: null });

  const key = `${from}-${to}-${attempt}`;
  const wantsLive = from !== to && Boolean(amount.trim()) && !manual.trim();
  const current = live.key === key ? live : { key, status: wantsLive ? 'loading' : 'idle' };

  useEffect(() => {
    if (!wantsLive) return undefined;
    const controller = new AbortController();
    let active = true;
    fetchRate(from, to, controller.signal).then(
      (rate) => active && setLive({ key, status: 'ready', ...rate }),
      () => active && setLive({ key, status: 'error' }),
    );
    return () => {
      active = false;
      controller.abort();
    };
  }, [from, to, key, wantsLive]);

  const { errors, result } = evaluate({ amount, manual }, current.status === 'ready' ? current : null, from, to);
  const isLoading = current.status === 'loading' && !result;
  const hasFailed = current.status === 'error' && !manual.trim();

  const reset = () => {
    setAmount('');
    setFrom('INR');
    setTo('USD');
    setManual('');
  };

  return (
    <ToolLayout toolId="currency-converter" content={content}>
      <TextToolShell
        formLabel="Enter an amount to convert"
        onClear={reset}
        panel={{ title: 'Converted Amount', icon: Coins, emptyText: 'Enter an amount to see it in another currency.' }}
        results={
          (isLoading || hasFailed || result) && (
          <>
            {isLoading && (
              <p role="status" className="mt-5 text-sm font-bold">
                Loading the latest rate…
              </p>
            )}
            {hasFailed && (
              <div role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">
                <p>{FETCH_ERROR}</p>
                <button type="button" className={`${actionButton} mt-3`} onClick={() => setAttempt((count) => count + 1)}>
                  <RefreshCw aria-hidden="true" className="size-5" />
                  Try again
                </button>
              </div>
            )}
            {result && (
              <>
                <div className="mt-5">
                  <ResultCard label={`${currencyName(result.to)} (${result.to})`} value={formatMoney(result.converted, result.to)} icon={Coins} />
                </div>
                <p className="mt-3 text-sm font-medium">{summary(result)}</p>
                <ResultDetails items={getRows(result)} />
                <p className="mt-4 text-sm text-ink/80">{NOTE}</p>
                <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
              </>
            )}
          </>
          )
        }
      >
        <CalculatorInput id="currency-amount" label="Amount" value={amount} onChange={setAmount} error={errors.amount} />
        <CurrencySelect id="currency-from" label="From" value={from} onChange={setFrom} />
        <button
          type="button"
          aria-label="Swap currencies"
          className={actionButton}
          onClick={() => {
            setFrom(to);
            setTo(from);
            setManual('');
          }}
        >
          <ArrowUpDown aria-hidden="true" className="size-5" />
          Swap
        </button>
        <CurrencySelect id="currency-to" label="To" value={to} onChange={setTo} />
        <CalculatorInput id="currency-rate" label={`Your own rate (optional): 1 ${from} = ? ${to}`} value={manual} onChange={setManual} error={errors.manual} />
      </TextToolShell>
    </ToolLayout>
  );
}
