import { ArrowLeftRight, Calculator, CalendarDays, IndianRupee } from 'lucide-react';

/** Tool categories, in navigation order. Adding one here adds its route, nav link and listing. */
export const CATEGORIES = [
  {
    id: 'calculators',
    name: 'Calculators',
    route: '/calculators',
    icon: Calculator,
    description: 'Work out ages, marks, percentages and more in seconds.',
    seo: {
      title: 'Free Online Calculators – Quick Everyday Calculations | ToolNest',
      description:
        'Free online calculators for everyday needs. Get accurate answers instantly in your browser, with no sign-up required.',
    },
  },
  {
    id: 'converters',
    name: 'Converters',
    route: '/converters',
    icon: ArrowLeftRight,
    description: 'Convert between common units of measurement.',
    seo: {
      title: 'Free Online Unit Converters | ToolNest',
      description:
        'Free online unit converters for everyday measurements. Convert values instantly in your browser, with no sign-up required.',
    },
  },
  {
    id: 'date-time',
    name: 'Date & Time',
    route: '/date-time',
    icon: CalendarDays,
    description: 'Calculate ages, dates and the time between them.',
    seo: {
      title: 'Free Date & Time Calculators | ToolNest',
      description:
        'Free date and time tools, including an exact age calculator. Accurate calendar calculations that handle leap years and month ends.',
    },
  },
  {
    id: 'finance',
    name: 'Finance',
    route: '/finance',
    icon: IndianRupee,
    description: 'Simple tools for everyday money calculations.',
    seo: {
      title: 'Free Online Finance Calculators | ToolNest',
      description:
        'Free online finance calculators for everyday money questions. Clear breakdowns that run entirely in your browser.',
    },
  },
];

export const getCategory = (id) => CATEGORIES.find((category) => category.id === id);
