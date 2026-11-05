import { Link } from 'react-router';
import { siteConfig } from '../../config/site.js';

const footerLinkClass = 'font-semibold text-primary underline underline-offset-2';

export default function Footer() {
  return (
    <footer className="mt-12 px-4 pb-10 text-center text-sm text-ink/80 print:hidden">
      <p>What you enter stays in your browser. It is never sent or stored.</p>
      <p className="mt-1">
        © {new Date().getFullYear()} {siteConfig.name} ·{' '}
        <Link to="/about" className={footerLinkClass}>
          About
        </Link>{' '}
        ·{' '}
        <Link to="/contact" className={footerLinkClass}>
          Contact
        </Link>{' '}
        ·{' '}
        <a href="/privacy.html" className={footerLinkClass}>
          Privacy Policy
        </a>
      </p>
    </footer>
  );
}
