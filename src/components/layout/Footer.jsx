import { siteConfig } from '../../config/site.js';

export default function Footer() {
  return (
    <footer className="mt-12 px-4 pb-10 text-center text-sm text-ink/80 print:hidden">
      <p>Your dates stay in your browser. They are never sent or stored.</p>
      <p className="mt-1">
        © {new Date().getFullYear()} {siteConfig.name}
      </p>
    </footer>
  );
}
