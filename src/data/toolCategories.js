import { ArrowLeftRight, Calculator, CalendarDays, Code, FileText, Image, IndianRupee, Type, Wrench } from 'lucide-react';

/** Tool categories, in navigation order. Adding one here adds its route, nav link and listing. */
export const CATEGORIES = [
  {
    id: 'calculators',
    name: 'Calculators',
    route: '/calculators',
    icon: Calculator,
    description: 'Work out ages, marks, percentages and more in seconds.',
    seo: {
      title: 'Free Online Calculators – Everyday Calculations | ToolNest',
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
  {
    id: 'text-tools',
    name: 'Text & Writing',
    route: '/text-tools',
    icon: Type,
    description: 'Count, clean up and transform your text.',
    seo: {
      title: 'Free Online Text & Writing Tools | ToolNest',
      description:
        'Free online text and writing tools to count, clean up and transform your text. Everything runs in your browser, with no sign-up required.',
    },
  },
  {
    id: 'pdf-tools',
    name: 'PDF Tools',
    route: '/pdf-tools',
    icon: FileText,
    description: 'Work with PDF files and their pages.',
    seo: {
      title: 'Free Online PDF Tools | ToolNest',
      description:
        'Free online PDF tools for working with your documents and their pages. Simple to use, with no sign-up required.',
    },
  },
  {
    id: 'image-tools',
    name: 'Image Tools',
    route: '/image-tools',
    icon: Image,
    description: 'Prepare and edit your images.',
    seo: {
      title: 'Free Online Image Tools | ToolNest',
      description:
        'Free online image tools to prepare and edit your pictures. Simple to use on any device, with no sign-up required.',
    },
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    route: '/developer-tools',
    icon: Code,
    description: 'Format, encode and inspect code and data.',
    seo: {
      title: 'Free Online Developer Tools | ToolNest',
      description:
        'Free online developer tools to format, encode and inspect code and data. Your input stays in your browser, with no sign-up required.',
    },
  },
  {
    id: 'everyday-tools',
    name: 'Everyday Tools',
    route: '/everyday-tools',
    icon: Wrench,
    description: 'Handy little tools for daily tasks.',
    seo: {
      title: 'Free Online Everyday Tools | ToolNest',
      description:
        'Free online everyday tools for quick daily tasks. Handy, simple and ready to use in your browser, with no sign-up required.',
    },
  },
];

export const getCategory = (id) => CATEGORIES.find((category) => category.id === id);
