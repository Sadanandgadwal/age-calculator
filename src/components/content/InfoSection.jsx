import { ChevronDown } from 'lucide-react';
import { FAQS, USEFUL_INFO } from '../../content/faqs.js';

export default function InfoSection() {
  return (
    <div className="mt-12 flex flex-col gap-12 print:hidden">
      <section aria-labelledby="useful-info-heading">
        <h2 id="useful-info-heading" className="text-2xl font-extrabold tracking-tight">
          Useful information
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {USEFUL_INFO.map(({ question, answer }) => (
            <article key={question} className="rounded-2xl bg-card p-6 shadow-card">
              <h3 className="font-bold">{question}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl font-extrabold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="mt-5 divide-y divide-line rounded-2xl bg-card px-6 shadow-card">
          {FAQS.map(({ question, answer }) => (
            <details key={question} className="group py-1">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 font-bold marker:content-none [&::-webkit-details-marker]:hidden">
                <h3>{question}</h3>
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="pb-4 text-[15px] leading-relaxed text-ink/80">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
