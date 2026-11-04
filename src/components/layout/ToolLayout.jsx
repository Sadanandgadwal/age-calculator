import { ChevronDown } from 'lucide-react';
import AdSlot from '../ads/AdSlot.jsx';
import Breadcrumb from '../common/Breadcrumb.jsx';
import { ToolNameContext } from '../common/toolContext.js';
import RelatedTools from '../common/RelatedTools.jsx';
import Header from './Header.jsx';
import { getToolById } from '../../data/toolsRegistry.js';

function InfoCards({ id, title, items }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-2xl font-extrabold tracking-tight">
        {title}
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ title: itemTitle, text }) => (
          <article key={itemTitle} className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="font-bold">{itemTitle}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Faqs({ faqs }) {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-extrabold tracking-tight">
        Frequently asked questions
      </h2>
      <div className="mt-5 divide-y divide-line rounded-2xl bg-card px-6 shadow-card">
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group py-1">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 font-bold marker:content-none [&::-webkit-details-marker]:hidden">
              <h3>{question}</h3>
              <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-[15px] leading-relaxed text-ink/80">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function ToolLayout({ toolId, content, children }) {
  const { name, description, icon: Icon } = getToolById(toolId);

  return (
    <main>
      <Breadcrumb />
      <Header
        icon={
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary sm:size-16">
            <Icon aria-hidden="true" className="size-6 text-primary sm:size-9" />
          </span>
        }
        title={name}
        description={description}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AdSlot placement="header" className="mb-8" />
        <ToolNameContext.Provider value={name}>
          <div className="print-results">{children}</div>
        </ToolNameContext.Provider>
        <AdSlot placement="inContent" className="mt-12" />
        <div className="mt-12 flex flex-col gap-12 print:hidden">
          <InfoCards id="how-it-works-heading" title="How it works" items={content.howItWorks} />
          <InfoCards id="formulas-heading" title="Formulas" items={content.formulas} />
          <InfoCards id="examples-heading" title="Examples" items={content.examples} />
          <Faqs faqs={content.faqs} />
        </div>
        <RelatedTools toolId={toolId} />
        <AdSlot placement="footer" className="mt-12" />
      </div>
    </main>
  );
}
