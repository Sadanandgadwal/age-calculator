const TWO_32 = 2 ** 32;
const TWO_53 = 2 ** 53;

function randomUint53() {
  const [high, low] = crypto.getRandomValues(new Uint32Array(2));
  return (high & 0x1fffff) * TWO_32 + low;
}

export function randomBelow(limit) {
  const unbiasedMax = TWO_53 - (TWO_53 % limit);
  let value = randomUint53();
  while (value >= unbiasedMax) value = randomUint53();
  return value % limit;
}

export function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = randomBelow(index + 1);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
