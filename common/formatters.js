export const toCurrency = (value) => {
  if (value === null || value === undefined) {
    return "$0.00";
  }
  const numberValue = parseFloat(value);
  if (isNaN(numberValue)) {
    return "$0.00";
  }
  return numberValue.toLocaleString("es-Mx", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}