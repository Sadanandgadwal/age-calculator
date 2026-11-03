import { Link } from 'react-router';
import Breadcrumb from '../components/common/Breadcrumb.jsx';
import { siteConfig } from '../config/site.js';

const POINTS = [
  {
    title: 'Private by design',
    text: 'Every calculation runs in your browser. What you enter is not sent to a server or stored.',
  },
  {
    title: 'Free, with no sign-up',
    text: 'You can open any tool and use it straight away, without creating an account.',
  },
  {
    title: 'Built with care',
    text: 'Each tool is covered by automated tests, including tricky cases such as leap years and month ends.',
  },
];

export default function AboutPage() {
  return (
    <main>
      <Breadcrumb />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="pt-8 text-center text-4xl font-extrabold tracking-tight sm:pt-10 sm:text-5xl">
          About {siteConfig.name}
        </h1>
        <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-28 rounded-full bg-mint" />
        <p className="mt-6 text-center text-lg text-ink/80">
          {siteConfig.name} is a growing collection of small, focused online tools for everyday calculations. Our goal
          is simple: give you a clear, accurate answer quickly, on any device.
        </p>

        <div className="mt-10 grid gap-4">
          {POINTS.map(({ title, text }) => (
            <section key={title} className="rounded-2xl bg-card p-6 shadow-card">
              <h2 className="font-extrabold">{title}</h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink/80">{text}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-center">
          <Link to="/all-tools" className="font-bold text-primary underline underline-offset-2">
            Browse all tools
          </Link>
        </p>
      </div>
    </main>
  );
}
