const COLUMNS = ['UK', 'US', 'EU', 'India', 'Foot length (cm)'];

const rows = (list) => list.map(([uk, us, eu, cm]) => [uk, us, eu, uk, cm]);

export const CHARTS = [
  {
    id: 'men',
    name: 'Men’s shoes',
    columns: COLUMNS,
    rows: rows([
      ['5.5', '6', '38.5', '24'],
      ['6', '6.5', '39', '24.5'],
      ['6.5', '7', '40', '25'],
      ['7', '7.5', '40.5', '25.5'],
      ['7.5', '8', '41', '26'],
      ['8', '8.5', '42', '26.5'],
      ['8.5', '9', '42.5', '27'],
      ['9', '9.5', '43', '27.5'],
      ['9.5', '10', '44', '28'],
      ['10', '10.5', '44.5', '28.5'],
      ['10.5', '11', '45', '29'],
      ['11', '11.5', '45.5', '29.5'],
      ['11.5', '12', '46', '30'],
      ['12.5', '13', '47.5', '31'],
    ]),
  },
  {
    id: 'women',
    name: 'Women’s shoes',
    columns: COLUMNS,
    rows: rows([
      ['3', '5', '35.5', '22'],
      ['3.5', '5.5', '36', '22.5'],
      ['4', '6', '36.5', '23'],
      ['4.5', '6.5', '37', '23.5'],
      ['5', '7', '37.5', '24'],
      ['5.5', '7.5', '38', '24.5'],
      ['6', '8', '38.5', '25'],
      ['6.5', '8.5', '39', '25.5'],
      ['7', '9', '40', '26'],
      ['7.5', '9.5', '40.5', '26.5'],
      ['8', '10', '41', '27'],
      ['8.5', '10.5', '42', '27.5'],
      ['9', '11', '42.5', '28'],
    ]),
  },
];

export const NOTE = 'These sizes are approximate. Brands size their shoes differently, so check the brand’s own chart, and measure your foot in the evening when it is largest.';
export const DEFAULTS = { chart: 'men', column: 0, size: '8' };
