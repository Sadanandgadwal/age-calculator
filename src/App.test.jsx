import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import ToolDirectoryPage from './pages/ToolDirectoryPage.jsx';
import { getAllPaths, getPageMeta } from './seo/pageMeta.js';

function renderAt(path) {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  return user;
}

const pageHeading = (name) => screen.findByRole('heading', { level: 1, name });
const search = () => screen.getByRole('textbox', { name: /search tools/i });

describe('routes', () => {
  it.each([
    ['/', 'Everyday Tools, All in One Place'],
    ['/all-tools', 'All Tools'],
    ['/calculators', 'Calculators'],
    ['/converters', 'Converters'],
    ['/date-time', 'Date & Time'],
    ['/finance', 'Finance'],
    ['/emi-calculator', 'EMI Calculator'],
    ['/time-calculator', 'Time Calculator'],
    ['/discount-calculator', 'Discount Calculator'],
    ['/bill-split-calculator', 'Bill Split Calculator'],
    ['/temperature-converter', 'Temperature Converter'],
    ['/area-converter', 'Area Converter'],
    ['/volume-converter', 'Volume Converter'],
    ['/data-storage-converter', 'Data Storage Converter'],
    ['/speed-converter', 'Speed Converter'],
    ['/time-unit-converter', 'Time Unit Converter'],
    ['/pressure-converter', 'Pressure Converter'],
    ['/energy-converter', 'Energy Converter'],
    ['/frequency-converter', 'Frequency Converter'],
    ['/angle-converter', 'Angle Converter'],
    ['/countdown-timer', 'Countdown Timer'],
    ['/stopwatch', 'Online Stopwatch'],
    ['/time-zone-converter', 'Time Zone Converter'],
    ['/business-days-calculator', 'Business Days Calculator'],
    ['/about', 'About ToolNest'],
    ['/contact', 'Contact'],
    ['/age-calculator', 'Age Calculator'],
    ['/marks-percentage-calculator', 'Marks & Percentage Calculator'],
    ['/percentage-calculator', 'Percentage Calculator'],
    ['/kg-to-gram-converter', 'KG to Gram Converter'],
    ['/cm-to-feet-converter', 'CM to Feet Converter'],
    ['/date-calculator', 'Date Calculator'],
    ['/gst-calculator', 'GST Calculator'],
  ])('%s shows its page', async (path, heading) => {
    renderAt(path);
    expect(await pageHeading(heading)).toBeInTheDocument();
  });

  it('shows the not-found page for an unknown URL', async () => {
    renderAt('/no-such-page');
    expect(await pageHeading('Page not found')).toBeInTheDocument();
  });

  it('gives every page exactly one h1 and the correct document title', async () => {
    for (const path of getAllPaths()) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );
      await screen.findByRole('heading', { level: 1 });
      expect(screen.getAllByRole('heading', { level: 1 }), path).toHaveLength(1);
      expect(document.title, path).toBe(getPageMeta(path).title);
      unmount();
    }
  });
});

describe('navigation', () => {
  it('offers every main section', async () => {
    renderAt('/');
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const links = within(document.getElementById('mobile-menu')).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Home',
      'All Tools',
      'Calculators',
      'Converters',
      'Date & Time',
      'Finance',
      'About',
      'Contact',
    ]);
  });

  it('opens the mobile menu, reports its state, and closes after choosing a link', async () => {
    const user = renderAt('/');
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');

    await user.click(within(document.getElementById('mobile-menu')).getByRole('link', { name: 'About' }));
    expect(await pageHeading('About ToolNest')).toBeInTheDocument();
    expect(document.getElementById('mobile-menu')).not.toBeInTheDocument();
  });

  it('opens a tool from its card and updates the title', async () => {
    const user = renderAt('/all-tools');
    await user.click(screen.getByRole('link', { name: 'Open Tool: Age Calculator' }));

    expect(await pageHeading('Age Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    expect(document.title).toBe('Age Calculator – Calculate Your Exact Age Online');
  });

  it('shows a working breadcrumb on tool pages', async () => {
    const user = renderAt('/age-calculator');
    await pageHeading('Age Calculator');

    const breadcrumb = within(screen.getByRole('navigation', { name: 'Breadcrumb' }));
    expect(breadcrumb.getByText('Age Calculator')).toHaveAttribute('aria-current', 'page');

    await user.click(breadcrumb.getByRole('link', { name: 'Calculators' }));
    expect(await pageHeading('Calculators')).toBeInTheDocument();
  });

  it('scrolls to the top when the page changes', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo');
    const user = renderAt('/');
    scrollTo.mockClear();

    await user.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'About' }));
    await pageHeading('About ToolNest');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});

describe('homepage', () => {
  it('shows the headline, listings and categories', () => {
    renderAt('/');
    expect(screen.getByText('Free, simple and powerful online tools to make everyday calculations easier.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Popular tools' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recently added' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Browse by category' })).toBeInTheDocument();
  });

  it('shows tool card details', () => {
    renderAt('/');
    const card = within(screen.getAllByRole('article')[0]);
    expect(card.getByRole('heading', { name: 'Age Calculator' })).toBeInTheDocument();
    expect(card.getByText(/exact age in years/)).toBeInTheDocument();
    expect(card.getByText('Calculators')).toBeInTheDocument();
    expect(card.getByRole('link', { name: 'Open Tool: Age Calculator' })).toHaveAttribute('href', '/age-calculator');
  });

  it('searches by tool name and replaces the listings with results', async () => {
    const user = renderAt('/');
    await user.type(search(), 'birthday');

    expect(screen.getByRole('status')).toHaveTextContent('1 tool found for “birthday”');
    expect(screen.getByRole('link', { name: 'Open Tool: Age Calculator' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Popular tools' })).not.toBeInTheDocument();
  });

  it('searches by category', async () => {
    const user = renderAt('/');
    await user.type(search(), 'date & time');
    expect(screen.getByRole('link', { name: 'Open Tool: Age Calculator' })).toBeInTheDocument();
  });

  it('shows an empty state, and clearing it restores the listings', async () => {
    const user = renderAt('/');
    await user.type(search(), 'zzzz');

    expect(screen.getByText('No tools match your search')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 tools found');

    // The search box's own clear icon has the same name as the button in the empty state.
    await user.click(within(screen.getByRole('region', { name: 'Search results' })).getByRole('button', { name: 'Clear search' }));
    expect(search()).toHaveValue('');
    expect(screen.getByRole('heading', { name: 'Popular tools' })).toBeInTheDocument();
  });

  it('treats spaces alone as no search', async () => {
    const user = renderAt('/');
    await user.type(search(), '   ');
    expect(screen.getByRole('heading', { name: 'Popular tools' })).toBeInTheDocument();
  });
});

describe('tool directory', () => {
  it('filters by category through the links', async () => {
    const user = renderAt('/all-tools');
    const filters = within(screen.getByRole('navigation', { name: 'Filter by category' }));

    expect(filters.getByRole('link', { name: 'All Tools' })).toHaveAttribute('aria-current', 'page');

    await user.click(filters.getByRole('link', { name: 'Date & Time' }));
    expect(await pageHeading('Date & Time')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Tool: Age Calculator' })).toBeInTheDocument();
  });

  it('starts a fresh search on each category page', async () => {
    const user = renderAt('/all-tools');
    await user.type(search(), 'age');
    await user.click(within(screen.getByRole('navigation', { name: 'Filter by category' })).getByRole('link', { name: 'Finance' }));

    await pageHeading('Finance');
    expect(search()).toHaveValue('');
  });

  it('searches within the current category only', async () => {
    const user = renderAt('/finance');
    await user.type(search(), 'birthday');
    expect(screen.getByText('No tools match your search')).toBeInTheDocument();
  });

  it('explains an empty category and links to all tools', () => {
    render(
      <MemoryRouter>
        <ToolDirectoryPage category={{ id: 'empty', name: 'Empty', description: 'Nothing yet.' }} />
      </MemoryRouter>,
    );
    expect(screen.getByText('No tools here yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all tools' })).toHaveAttribute('href', '/all-tools');
  });
});

describe('contact page', () => {
  it('says the inbox is being set up, instead of inventing an address', () => {
    renderAt('/contact');
    expect(screen.getByText('Our inbox is being set up')).toBeInTheDocument();
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});

describe('author', () => {
  it.each(getAllPaths())('is not displayed on %s', async (path) => {
    renderAt(path);
    await screen.findByRole('heading', { level: 1 });
    expect(document.body.textContent).not.toMatch(/sadanand/i);
  });
});

describe('ErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows a recovery message when a page fails to load', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => {
      throw new Error('chunk failed');
    };

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: "This page couldn't load" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument();
  });
});
