import { useState, useEffect } from "react";
import { evaluate } from "mathjs";

/**
 * FormulaEditor
 * Permite definir una fórmula para un producto de una sucursal, mostrando variables disponibles y preview del resultado.
 * Props:
 * - branchName: string
 * - productName: string
 * - prices: objeto { nombre: valor } (ej: { piernaymuslo: 10, pechuga: 12 })
 * - initialFormula: string
 * - onSave: (formula: string) => void
 * - variables: array de strings (ej: ["piernaymuslo", "pechuga"])
 */
export default function FormulaEditor({ branchName, productName, prices, initialFormula = '', onSave, variables = [] }) {
  const [formula, setFormula] = useState(initialFormula);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Inserta variable en la posición actual del cursor
  const insertVariable = (variable) => {
    setFormula(f => f + `{${variable}}`);
  };

  useEffect(() => {
    if (!formula) {
      setResult(null);
      setError(null);
      return;
    }
    let expr = formula;
    variables.forEach((v) => {
      const val = prices[v] ?? 0;
      expr = expr.replaceAll(`{${v}}`, val);
    });
    try {
      setResult(evaluate(expr));
      setError(null);
    } catch (err) {
      setResult(null);
      setError('Fórmula inválida');
    }
  }, [formula, prices, variables]);

  return (
    <div className="p-4 bg-white rounded-xl shadow max-w-lg mx-auto border border-gray-200">
      <h3 className="font-bold text-lg mb-2 text-blue-800">Fórmula para {productName} en {branchName}</h3>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Fórmula:</label>
        <textarea
          className="w-full border rounded p-2 text-sm font-mono"
          rows={3}
          value={formula}
          onChange={e => setFormula(e.target.value)}
          placeholder="Ejemplo: ({piernaymuslo} + {pechuga}) / 2"
        />
      </div>
      <div className="mb-2">
        <span className="font-semibold">Variables disponibles:</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {variables.map(v => (
            <button
              key={v}
              type="button"
              className="bg-gray-200 hover:bg-blue-200 text-xs rounded px-2 py-1 font-mono border border-gray-300"
              onClick={() => insertVariable(v)}
            >
              {'{'}{v}{'}'}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Preview resultado:</span>{' '}
        {error ? <span className="text-red-600">{error}</span> : <span className="text-green-700 font-bold">{result !== null ? result : '-'}</span>}
      </div>
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
        type="button"
        onClick={() => onSave(formula)}
        disabled={!!error || !formula}
      >
        Guardar fórmula
      </button>
    </div>
  );
}
