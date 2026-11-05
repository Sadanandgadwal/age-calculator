import { Mail } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb.jsx';
import { siteConfig } from '../config/site.js';

export default function ContactPage() {
  const { contactEmail } = siteConfig;

  return (
    <main>
      <Breadcrumb />
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="pt-8 text-center text-4xl font-extrabold tracking-tight sm:pt-10 sm:text-5xl">Contact</h1>
        <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-28 rounded-full bg-mint" />
        <p className="mt-6 text-center text-lg text-ink/80">
          Found a problem, or have an idea for a new tool? We'd like to hear about it.
        </p>

        <section className="mt-10 rounded-2xl bg-card p-6 text-center shadow-card sm:p-8">
          <Mail aria-hidden="true" className="mx-auto size-8 text-primary" />
          {contactEmail ? (
            <>
              <h2 className="mt-3 font-extrabold">Email us</h2>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-1 inline-block font-bold break-all text-primary underline underline-offset-2"
              >
                {contactEmail}
              </a>
            </>
          ) : (
            <>
              <h2 className="mt-3 font-extrabold">Our inbox is being set up</h2>
              <p className="mt-1 text-[15px] text-ink/80">A contact address will appear here soon.</p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
