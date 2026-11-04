import { Cake, CalendarRange, GraduationCap, Percent, Ruler, Scale } from 'lucide-react';

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
  {
    id: 'marks-percentage-calculator',
    name: 'Marks & Percentage Calculator',
    route: '/marks-percentage-calculator',
    categories: ['calculators'],
    icon: GraduationCap,
    description: 'Calculate exam totals, percentage and grades, and the marks you need to reach a target.',
    keywords: ['marks', 'exam', 'result', 'grade', 'subject', 'score', 'cgpa', 'target', 'school', 'percentage'],
    featured: true,
    addedOn: '2026-11-03',
    seo: {
      title: 'Marks & Percentage Calculator – Calculate Exam Results',
      description:
        'Calculate total marks, percentage and grade across any number of subjects. Find your highest and lowest subjects and the marks needed to reach your target.',
      featureList: [
        'Subject-wise and overall marks',
        'Total, percentage and average marks',
        'Highest and lowest scoring subjects',
        'Configurable grading scales',
        'Target percentage and remaining marks',
      ],
    },
    load: () => import('../tools/marks-percentage/Page.jsx'),
    loadContent: () => import('../tools/marks-percentage/content.js'),
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    route: '/percentage-calculator',
    categories: ['calculators'],
    icon: Percent,
    description: 'Solve any percentage question, with the formula and steps shown.',
    keywords: ['percent', 'increase', 'decrease', 'difference', 'change', 'discount', 'ratio', 'of'],
    featured: true,
    addedOn: '2026-11-04',
    seo: {
      title: 'Free Percentage Calculator – Calculate Percentages Online',
      description:
        'Find percentages, increases, decreases, differences and changes between values. See the formula and every calculation step with this free percentage calculator.',
      featureList: [
        'Percentage of a number',
        'Percentage increase and decrease',
        'Percentage difference and change',
        'Add or subtract a percentage',
        'Formula and calculation steps',
      ],
    },
    load: () => import('../tools/percentage/Page.jsx'),
    loadContent: () => import('../tools/percentage/content.js'),
  },
  {
    id: 'kg-to-gram-converter',
    name: 'KG to Gram Converter',
    route: '/kg-to-gram-converter',
    categories: ['converters'],
    icon: Scale,
    description: 'Convert instantly between kilograms, grams, milligrams, tonnes, pounds and ounces.',
    keywords: ['kg', 'gram', 'weight', 'mass', 'kilogram', 'milligram', 'tonne', 'pound', 'lb', 'ounce', 'oz'],
    featured: true,
    addedOn: '2026-11-04',
    seo: {
      title: 'KG to Gram Converter – Free Weight Conversion Tool',
      description:
        'Convert kg to grams and between milligrams, tonnes, pounds and ounces. Instant, accurate weight conversions with the formula shown, free in your browser.',
      featureList: [
        'Kilograms, grams, milligrams, tonnes, pounds and ounces',
        'Instant conversion as you type',
        'One-click unit swap',
        'Conversion formula and rate',
      ],
    },
    load: () => import('../tools/weight/Page.jsx'),
    loadContent: () => import('../tools/weight/content.js'),
  },
  {
    id: 'cm-to-feet-converter',
    name: 'CM to Feet Converter',
    route: '/cm-to-feet-converter',
    categories: ['converters'],
    icon: Ruler,
    description: 'Convert instantly between centimeters, meters, kilometers, millimeters, feet, inches, yards and miles.',
    keywords: ['cm', 'feet', 'ft', 'foot', 'length', 'height', 'distance', 'inch', 'meter', 'metre', 'km', 'mm', 'yard', 'mile'],
    featured: true,
    addedOn: '2026-11-04',
    seo: {
      title: 'CM to Feet Converter – Free Length Conversion Tool',
      description:
        'Convert cm to feet and inches, and between meters, kilometers, millimeters, yards and miles. Instant, accurate length conversions with the formula shown.',
      featureList: [
        'Centimeters, meters, kilometers, millimeters, feet, inches, yards and miles',
        'Combined feet and inches result',
        'Instant conversion as you type',
        'One-click unit swap',
        'Conversion formula and rate',
      ],
    },
    load: () => import('../tools/length/Page.jsx'),
    loadContent: () => import('../tools/length/content.js'),
  },
  {
    id: 'date-calculator',
    name: 'Date Calculator',
    route: '/date-calculator',
    categories: ['calculators', 'date-time'],
    icon: CalendarRange,
    description: 'Count the days between dates, add or subtract time, and find business days and weekends.',
    keywords: ['date', 'days between', 'duration', 'add days', 'subtract days', 'business days', 'working days', 'weekdays', 'weekends', 'calendar'],
    featured: true,
    addedOn: '2026-11-04',
    seo: {
      title: 'Date Calculator – Calculate Days Between Dates',
      description:
        'Calculate the days between two dates, add or subtract days, months and years, and count business days and weekends. Handles leap years and month ends.',
      featureList: [
        'Days between two dates',
        'Add or subtract days, months and years',
        'Business days, weekdays and weekends',
        'Inclusive or exclusive day counting',
        'Leap year and month-end handling',
      ],
    },
    load: () => import('../tools/date/Page.jsx'),
    loadContent: () => import('../tools/date/content.js'),
  },
];

export const getToolByRoute = (route) => TOOLS.find((tool) => tool.route === route);
export const getToolById = (id) => TOOLS.find((tool) => tool.id === id);
