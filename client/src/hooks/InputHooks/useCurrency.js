import { useState } from "react";

export function useCurrencyInput(initial = "") {
  const [display, setDisplay] = useState(initial);
  const [raw, setRaw] = useState(null);

  const formatCurrency = (num) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(num);

  const handleChange = (e) => {
    const input = e.target.value.replace(/[^0-9.]/g, "");

    // No permitir más de un punto decimal
    const parts = input.split(".");
    if (parts.length > 2) return;

    const parsed = parseFloat(input);
    if (!isNaN(parsed)) {
      setRaw(parsed);
      setDisplay(formatCurrency(parsed));
    } else {
      setRaw(null);
      setDisplay("");
    }
  };

  return {
    display,
    raw,
    bind: {
      value: display,
      onChange: handleChange,
      inputMode: "decimal",
    },
  };
}