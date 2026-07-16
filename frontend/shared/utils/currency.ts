export const formatIndianCurrency = (value: number | string | undefined): string => {
  const num = parseFloat((value || 0).toString());
  const hasDecimal = num % 1 !== 0;
  return '₹' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);
};
