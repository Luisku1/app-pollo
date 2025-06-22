import { useState, useEffect } from "react";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

export default function CurrencyInput({ name, value, placeholder, onChange }) {
  const [rawValue, setRawValue] = useState(value ?? "");

  useEffect(() => {
    setRawValue(value ?? "");
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value;

    const numeric = input.replace(/[^\d.]/g, "");
    const cleaned = numeric.split(".").length > 2
      ? numeric.replace(/\.+$/, "")
      : numeric;

    setRawValue(cleaned);

    if (onChange) {
      onChange(name, cleaned); // nombre del campo + valor numérico
    }
  };

  const formattedValue = rawValue
    ? currencyFormatter.format(Number(rawValue))
    : "";

  return (
    <input
      type="text"
      inputMode="decimal"
      name={name}
      value={formattedValue}
      onChange={handleChange}
      placeholder={placeholder ?? "0.00"}
      className="px-2 py-1 rounded border border-gray-300 w-full"
    />
  );
}