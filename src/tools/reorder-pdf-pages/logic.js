import { formatBytes } from '../../utils/imageFile.js';

export const initialOrder = (pageCount) => Array.from({ length: pageCount }, (_, index) => index);

export function moveTo(order, from, to) {
  if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) return order;
  const next = [...order];
  const [page] = next.splice(from, 1);
  next.splice(to, 0, page);
  return next;
}

export const isChanged = (order) => order.some((page, index) => page !== index);

export function describeOrder(order, limit = 20) {
  const pages = order.slice(0, limit).map((page) => page + 1).join(', ');
  return order.length > limit ? `${pages}, …` : pages;
}

export function getFacts(order, blob) {
  return [
    { label: 'New order', value: describeOrder(order) },
    { label: 'Pages', value: String(order.length) },
    { label: 'File size', value: formatBytes(blob.size) },
  ];
}
