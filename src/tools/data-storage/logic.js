import { evaluateConversion } from '../../utils/unitConversion.js';

const decimal = (id, name, symbol, power) => ({ id, name, symbol, factor: 1000 ** power });
const binary = (id, name, symbol, power) => ({ id, name, symbol, factor: 1024 ** power });

export const STORAGE_UNITS = [
  { id: 'b', name: 'Byte', symbol: 'B', factor: 1 },
  decimal('kb', 'Kilobyte', 'KB', 1),
  decimal('mb', 'Megabyte', 'MB', 2),
  decimal('gb', 'Gigabyte', 'GB', 3),
  decimal('tb', 'Terabyte', 'TB', 4),
  decimal('pb', 'Petabyte', 'PB', 5),
  binary('kib', 'Kibibyte', 'KiB', 1),
  binary('mib', 'Mebibyte', 'MiB', 2),
  binary('gib', 'Gibibyte', 'GiB', 3),
  binary('tib', 'Tebibyte', 'TiB', 4),
  binary('pib', 'Pebibyte', 'PiB', 5),
];

export const EXAMPLE_PAIRS = [
  ['gb', 'mb'],
  ['gib', 'mib'],
  ['kib', 'b'],
  ['gb', 'gib'],
  ['gib', 'gb'],
  ['gb', 'gib', 500],
];

export const evaluateStorage = (text, fromId, toId, units = STORAGE_UNITS) =>
  evaluateConversion(text, fromId, toId, units, { precise: true });
