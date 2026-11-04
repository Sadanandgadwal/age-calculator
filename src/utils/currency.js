const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export const formatInr = (paise) => inrFormatter.format(paise / 100);

export const toPaise = (value) => Math.round(Number((value * 100).toFixed(4)));
