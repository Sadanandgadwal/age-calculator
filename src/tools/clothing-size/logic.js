export const CHARTS = [
  {
    id: 'men',
    name: 'Men’s shirts and tops',
    columns: ['Letter', 'India', 'US', 'UK', 'EU', 'Chest (cm)'],
    rows: [
      ['XS', '36', '34', '34', '44', '86–91'],
      ['S', '38', '36', '36', '46', '91–96'],
      ['M', '40', '38', '38', '48', '96–101'],
      ['L', '42', '40', '40', '50', '101–106'],
      ['XL', '44', '42', '42', '52', '106–111'],
      ['XXL', '46', '44', '44', '54', '111–116'],
      ['3XL', '48', '46', '46', '56', '116–121'],
    ],
  },
  {
    id: 'women',
    name: 'Women’s tops and dresses',
    columns: ['Letter', 'India', 'US', 'UK', 'EU', 'Bust (cm)'],
    rows: [
      ['XS', '6', '2', '6', '34', '80–83'],
      ['S', '8', '4', '8', '36', '84–87'],
      ['M', '10', '6', '10', '38', '88–91'],
      ['L', '12', '8', '12', '40', '92–96'],
      ['XL', '14', '10', '14', '42', '97–101'],
      ['XXL', '16', '12', '16', '44', '102–107'],
      ['3XL', '18', '14', '18', '46', '108–113'],
    ],
  },
];

export const NOTE = 'These sizes are approximate. Brands and countries cut clothes differently, so check the brand’s own size chart and your chest or bust measurement before buying.';
export const DEFAULTS = { chart: 'men', column: 0, size: 'M' };
