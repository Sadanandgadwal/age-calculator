import { formatDialect, mariadb, mysql, postgresql, sql, sqlite, transactsql } from 'sql-formatter';
import { formatNumber } from '../../utils/formatResult.js';

export const DIALECTS = [
  { id: 'sql', name: 'Standard SQL', dialect: sql },
  { id: 'mysql', name: 'MySQL', dialect: mysql },
  { id: 'mariadb', name: 'MariaDB', dialect: mariadb },
  { id: 'postgresql', name: 'PostgreSQL', dialect: postgresql },
  { id: 'sqlite', name: 'SQLite', dialect: sqlite },
  { id: 'transactsql', name: 'SQL Server', dialect: transactsql },
];

const getDialect = (id) => DIALECTS.find((item) => item.id === id);

export function evaluate(text, dialectId, uppercase) {
  if (!text.trim()) return { error: null, output: null };
  try {
    return { error: null, output: formatDialect(text, { dialect: getDialect(dialectId).dialect, keywordCase: uppercase ? 'upper' : 'preserve', tabWidth: 2 }) };
  } catch (error) {
    return { error: error.message.split('\n')[0], output: null };
  }
}

export const buildReport = (output, dialectId, uppercase) => ({
  inputs: [
    { label: 'Dialect', value: getDialect(dialectId).name },
    { label: 'Uppercase keywords', value: uppercase ? 'Yes' : 'No' },
  ],
  results: [{ label: 'Lines', value: formatNumber(output.split('\n').length) }],
  text: { title: 'Formatted SQL', value: output, mono: true },
});
