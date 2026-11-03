import { useEffect, useRef } from 'react';
import {
  CalendarClock,
  CalendarDays,
  CalendarHeart,
  CalendarRange,
  Copy,
  Cake,
  Gift,
  Hourglass,
  Info,
  Layers,
  PartyPopper,
  Printer,
  Share2,
} from 'lucide-react';
import { useResultActions } from '../../hooks/useResultActions.js';
import { formatDate } from '../../utils/date.js';
import { formatCountdown, pluralize } from '../../utils/formatResult.js';

const AGE_CARDS = [
  { key: 'years', singular: 'Year', plural: 'Years', icon: CalendarDays, tone: 'bg-secondary', iconTone: 'text-primary' },
  { key: 'months', singular: 'Month', plural: 'Months', icon: CalendarRange, tone: 'bg-soft-yellow', iconTone: 'text-amber-700' },
  { key: 'days', singular: 'Day', plural: 'Days', icon: Hourglass, tone: 'bg-soft-lavender', iconTone: 'text-violet-700' },
];

function AgeCard({ value, singular, plural, icon: Icon, tone, iconTone }) {
  return (
    <div className={`flex flex-col items-center rounded-2xl px-1 py-5 text-center sm:py-6 ${tone}`}>
      <Icon aria-hidden="true" className={`size-7 sm:size-8 ${iconTone}`} />
      <p className="mt-2 flex flex-col">
        <span className="text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">{value}</span>
        <span className="mt-1 text-sm font-semibold sm:text-base">{value === 1 ? singular : plural}</span>
      </p>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, iconTone = 'text-primary', iconBg = 'bg-secondary' }) {
  return (
    // A div in a dl may only contain dt and dd, so the icon is positioned from inside the dt.
    <div className="relative flex min-h-20 flex-col justify-center py-4 pl-16 print:break-inside-avoid">
      <dt className="text-sm font-medium text-muted">
        <span className={`absolute top-1/2 left-0 grid size-12 -translate-y-1/2 place-items-center rounded-xl ${iconBg}`}>
          <Icon aria-hidden="true" className={`size-6 ${iconTone}`} />
        </span>
        {label}
      </dt>
      <dd className="mt-0.5 font-extrabold">{value}</dd>
    </div>
  );
}

function ActionButton({ icon: Icon, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-line bg-white px-1 text-sm font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint"
    >
      <Icon aria-hidden="true" className="size-4" />
      {children}
    </button>
  );
}

function ResultsHeader({ result, headingRef }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-secondary p-3 pr-5 print:bg-transparent print:p-0">
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-mint/60 sm:size-16">
        <Cake aria-hidden="true" className="size-7 text-primary sm:size-8" />
      </span>
      <div className="min-w-0">
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-extrabold tracking-tight outline-none sm:text-2xl">
          Your Exact Age
        </h2>
        {result && (
          <p className="mt-0.5 text-sm font-medium text-ink/80">
            Born {formatDate(result.birthDate)} · As of {formatDate(result.asOfDate)}
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center md:min-h-96">
      <CalendarHeart aria-hidden="true" className="size-12 text-mint" />
      <p className="mt-4 font-bold">Your results will appear here</p>
      <p className="mt-1 max-w-xs text-sm text-muted">
        Enter your date of birth and select Calculate Age to see your exact age and next birthday.
      </p>
    </div>
  );
}

function ResultDetails({ result, isStale }) {
  const { status, copy, share, print } = useResultActions(result);
  const { nextBirthday } = result;

  return (
    <>
      {isStale && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium print:hidden">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          You changed the dates. Select Calculate Age to update these results.
        </p>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3">
        {AGE_CARDS.map(({ key, ...card }) => (
          <AgeCard key={key} value={result[key]} {...card} />
        ))}
      </div>

      {nextBirthday.isToday && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-primary">
          <PartyPopper aria-hidden="true" className="size-4 shrink-0" />
          Happy birthday! You turn {nextBirthday.turning} on this date.
        </p>
      )}

      <dl className="mt-3 grid divide-y divide-line border-b border-line sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0 sm:[&>div]:border-t sm:[&>div]:border-line print:grid-cols-2">
        <DetailItem icon={CalendarDays} label="Total Days Lived" value={pluralize(result.totalDays, 'day')} />
        <DetailItem icon={Layers} label="Total Months Lived" value={pluralize(result.totalMonths, 'month')} />
        <DetailItem icon={CalendarRange} label="Total Weeks Lived" value={pluralize(result.totalWeeks, 'week')} />
        <DetailItem
          icon={Cake}
          label="Day of Birth"
          value={result.bornOnWeekday}
          iconTone="text-violet-700"
          iconBg="bg-soft-lavender"
        />
        <DetailItem
          icon={CalendarClock}
          label="Next Birthday In"
          value={formatCountdown(nextBirthday)}
          iconTone="text-amber-700"
          iconBg="bg-soft-yellow"
        />
        <DetailItem
          icon={Gift}
          label="Next Birthday On"
          value={formatDate(nextBirthday.date)}
          iconTone="text-amber-700"
          iconBg="bg-soft-yellow"
        />
      </dl>

      {nextBirthday.isObservedOnFeb28 && (
        <p className="mt-4 flex items-start gap-2 text-sm text-muted">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Born on 29 February: {nextBirthday.date.year} isn't a leap year, so your birthday is shown on 28 February.
        </p>
      )}

      <p className="sr-only">
        Your age is {pluralize(result.years, 'year')}, {pluralize(result.months, 'month')} and{' '}
        {pluralize(result.days, 'day')}.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 print:hidden">
        <ActionButton icon={Copy} onClick={copy}>Copy</ActionButton>
        <ActionButton icon={Share2} onClick={share}>Share</ActionButton>
        <ActionButton icon={Printer} onClick={print}>Print</ActionButton>
      </div>

      <p role="status" className="mt-3 min-h-5 text-center text-sm font-medium text-primary print:hidden">
        {status}
      </p>
    </>
  );
}

export default function AgeResults({ result, isStale }) {
  const headingRef = useRef(null);

  // Move focus to new results. On phones this also scrolls them into view below the form.
  useEffect(() => {
    if (result) headingRef.current?.focus();
  }, [result]);

  return (
    <section aria-label="Your results" className="rounded-3xl bg-card p-4 shadow-card sm:p-6 print:shadow-none">
      <ResultsHeader result={result} headingRef={headingRef} />
      {result ? <ResultDetails result={result} isStale={isStale} /> : <EmptyState />}
    </section>
  );
}
