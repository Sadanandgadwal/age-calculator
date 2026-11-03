import { Cake } from 'lucide-react';

/**
 * The single list of tools. Each entry drives the tool's route, cards, search
 * results, category listings, SEO tags and sitemap entry. To add a tool, add its
 * page and one entry here. List only working tools, as every entry goes live.
 *
 * `categories[0]` is the primary category, which the breadcrumb and card use.
 * `load` imports the page on demand, so tools don't add to the first page's size.
 * `loadContent` provides FAQs for structured data, using the same copy the page displays.
 */
export const TOOLS = [
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    route: '/age-calculator',
    categories: ['calculators', 'date-time'],
    icon: Cake,
    description: 'Find your exact age in years, months and days, plus your next birthday.',
    keywords: ['age', 'birthday', 'date of birth', 'dob', 'how old', 'years', 'months', 'days'],
    featured: true,
    addedOn: '2026-11-03',
    seo: {
      title: 'Age Calculator – Calculate Your Exact Age Online',
      description:
        'Calculate your exact age in years, months and days. Discover total days lived, next birthday countdown and more with our free online Age Calculator.',
      image: '/og-image.png',
      featureList: [
        'Exact age in years, months and days',
        'Age on any past or future date',
        'Total days, weeks and months lived',
        'Next birthday date and countdown',
        'Weekday of birth',
        'Leap year and 29 February handling',
      ],
    },
    load: () => import('../pages/AgeCalculatorPage.jsx'),
    loadContent: async () => {
      const { FAQS, USEFUL_INFO } = await import('../content/faqs.js');
      return { faqs: [...USEFUL_INFO, ...FAQS] };
    },
  },
];

export const getToolByRoute = (route) => TOOLS.find((tool) => tool.route === route);
