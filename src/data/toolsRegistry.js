import { Cake, CalendarRange, Clock, GraduationCap, Landmark, Percent, ReceiptIndianRupee, Ruler, Scale, Tag, Thermometer, Users } from 'lucide-react';

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
    featured: false,
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
    featured: false,
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
    featured: false,
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
  {
    id: 'gst-calculator',
    name: 'GST Calculator',
    route: '/gst-calculator',
    categories: ['finance', 'calculators'],
    icon: ReceiptIndianRupee,
    description: 'Add or remove Indian GST and see the CGST, SGST or IGST breakdown.',
    keywords: ['gst', 'tax', 'india', 'cgst', 'sgst', 'igst', 'invoice', 'inclusive', 'exclusive', 'rupee', 'inr'],
    featured: true,
    addedOn: '2026-11-04',
    seo: {
      title: 'GST Calculator India – Calculate CGST, SGST and IGST',
      description:
        'Add or remove GST at any rate and see the taxable amount, CGST, SGST, IGST and final amount in rupees. A free GST calculator for quick estimates in India.',
      featureList: [
        'Add GST or remove it from an inclusive amount',
        'CGST and SGST for intra-state transactions',
        'IGST for inter-state transactions',
        'Standard and custom GST rates',
        'Full breakdown in Indian rupees',
      ],
    },
    load: () => import('../tools/gst/Page.jsx'),
    loadContent: () => import('../tools/gst/content.js'),
  },
  {
    id: 'emi-calculator',
    name: 'EMI Calculator',
    route: '/emi-calculator',
    categories: ['calculators', 'finance'],
    icon: Landmark,
    description: 'Work out your monthly loan EMI, total interest and total payment.',
    keywords: ['emi', 'loan', 'home loan', 'car loan', 'personal loan', 'interest', 'instalment', 'installment', 'monthly payment', 'mortgage'],
    featured: true,
    addedOn: '2026-11-04',
    seo: {
      title: 'EMI Calculator – Calculate Your Monthly Loan EMI',
      description:
        'Calculate your monthly loan EMI, total interest and total payment. See a yearly repayment schedule for home, car and personal loans with this free calculator.',
      featureList: ['Monthly EMI', 'Total interest and total payment', 'Tenure in years or months', 'Yearly repayment schedule'],
    },
    load: () => import('../tools/emi/Page.jsx'),
    loadContent: () => import('../tools/emi/content.js'),
  },
  {
    id: 'time-calculator',
    name: 'Time Calculator',
    route: '/time-calculator',
    categories: ['calculators', 'date-time'],
    icon: Clock,
    description: 'Add and subtract time, and find the time between or after clock times.',
    keywords: ['time', 'hours', 'minutes', 'seconds', 'duration', 'clock', 'shift', 'overnight', 'add time', 'subtract time'],
    featured: false,
    addedOn: '2026-11-04',
    seo: {
      title: 'Time Calculator – Add, Subtract and Compare Times',
      description:
        'Add and subtract hours, minutes and seconds, find the time between two clock times, and work out the time before or after a duration with this free calculator.',
      featureList: ['Add and subtract times', 'Time between two clock times', 'Overnight time handling', 'Time before or after a duration', 'Total hours, minutes and seconds'],
    },
    load: () => import('../tools/time/Page.jsx'),
    loadContent: () => import('../tools/time/content.js'),
  },
  {
    id: 'discount-calculator',
    name: 'Discount Calculator',
    route: '/discount-calculator',
    categories: ['calculators', 'finance'],
    icon: Tag,
    description: 'Find the sale price, your savings, the discount percentage or the original price.',
    keywords: ['discount', 'sale', 'price', 'off', 'savings', 'coupon', 'offer', 'shopping', 'markdown'],
    featured: false,
    addedOn: '2026-11-04',
    seo: {
      title: 'Discount Calculator – Find Sale Price and Savings',
      description:
        'Calculate the price after a discount, how much you save, the discount percentage and the original price. A free, simple discount calculator for everyday shopping.',
      featureList: ['Price after a percentage discount', 'Price after a fixed discount', 'Discount percentage from two prices', 'Original price from a sale price'],
    },
    load: () => import('../tools/discount/Page.jsx'),
    loadContent: () => import('../tools/discount/content.js'),
  },
  {
    id: 'bill-split-calculator',
    name: 'Bill Split Calculator',
    route: '/bill-split-calculator',
    categories: ['calculators', 'finance'],
    icon: Users,
    description: 'Split a bill between friends, with tax and tip, down to the last paisa.',
    keywords: ['bill', 'split', 'share', 'restaurant', 'tip', 'friends', 'group', 'dinner', 'divide', 'expense'],
    featured: false,
    addedOn: '2026-11-04',
    seo: {
      title: 'Bill Split Calculator – Split Bills, Tax and Tips',
      description:
        'Split a bill between any number of people, including tax and tip. See what each person pays, exact to the paisa or rounded up, with this free bill split calculator.',
      featureList: ['Equal split between any number of people', 'Optional tax and tip', 'Exact shares to the paisa', 'Round up to whole rupees'],
    },
    load: () => import('../tools/bill-split/Page.jsx'),
    loadContent: () => import('../tools/bill-split/content.js'),
  },
  {
    id: 'temperature-converter',
    name: 'Temperature Converter',
    route: '/temperature-converter',
    categories: ['converters'],
    icon: Thermometer,
    description: 'Convert between Celsius, Fahrenheit and Kelvin, with the exact formula shown.',
    keywords: ['temperature', 'celsius', 'fahrenheit', 'kelvin', 'c to f', 'f to c', 'weather', 'degrees', 'thermometer'],
    featured: false,
    addedOn: '2026-11-04',
    seo: {
      title: 'Temperature Converter – Celsius, Fahrenheit and Kelvin',
      description:
        'Convert temperatures between Celsius, Fahrenheit and Kelvin instantly, with the exact formula shown. Accepts negative values down to absolute zero. Free to use.',
      featureList: ['Celsius, Fahrenheit and Kelvin', 'Instant conversion as you type', 'Negative temperatures down to absolute zero', 'Exact conversion formulas'],
    },
    load: () => import('../tools/temperature/Page.jsx'),
    loadContent: () => import('../tools/temperature/content.js'),
  },
];

export const getToolByRoute = (route) => TOOLS.find((tool) => tool.route === route);
export const getToolById = (id) => TOOLS.find((tool) => tool.id === id);
