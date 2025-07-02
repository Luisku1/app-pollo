/* eslint-disable react/prop-types */

import { currency } from "../../helpers/Functions";
import ChangeBranchPrices from "./ChangeBranchPrices"

export default function BranchPrices({ prices, pricesDate, branch, onChange, onUpdateBranchReport }) {
  const isEmpty = !prices || prices.length === 0;

  // Agrupar productos en pares para doble columna
  const productPairs = [];
  if (prices && prices.length > 0) {
    for (let i = 0; i < prices.length; i += 2) {
      productPairs.push([
        prices[i],
        prices[i + 1] || null
      ]);
    }
  }

  console.log(prices, productPairs)
  const renderPrices = () => (
    <table className="w-full text-sm table-fixed">
      <colgroup>
        <col className="w-1/4" />
        <col className="w-1/4" />
        <col className="w-1/4" />
        <col className="w-1/4" />
      </colgroup>
      <thead>
        <tr className="bg-gray-100 text-xs text-gray-700">
          <th className="px-2 py-1 text-left">Producto</th>
          <th className="px-2 py-1 text-center rounded transition bg-gray-200 text-gray-700">Precio</th>
          <th className="px-2 py-1 text-left">Producto</th>
          <th className="px-2 py-1 text-center rounded transition bg-gray-200 text-gray-700">Precio</th>
        </tr>
      </thead>
      <tbody>
        {productPairs.map((pair, idx) => {
          const [left, right] = pair;
          return (
            <tr key={idx} className="border-b last:border-b-0">
              {/* Columna izquierda */}
              <td className="px-2 py-1 font-medium text-gray-700 whitespace-normal">
                {left ? left.product : ''}
              </td>
              <td className="px-2 py-1">
                {left && (
                  <span className="text-red-800 font-bold">{currency({ amount: left.latestPrice })}</span>
                )}
              </td>
              {/* Columna derecha */}
              <td className="px-2 py-1 font-medium text-gray-700 whitespace-normal break-words">
                {right ? right.product : ''}
              </td>
              <td className="px-2 py-1">
                {right && (
                  <span className="text-red-800 font-bold">{currency({ amount: right.latestPrice })}</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="p-1 border justify-items-center rounded-lg shadow-md text-lg">
      {onChange ?
        <ChangeBranchPrices onUpdateBranchReport={onUpdateBranchReport} onChange={onChange} branch={branch} pricesDate={pricesDate}>
          {renderPrices()}
        </ChangeBranchPrices>
        :
        <div>
          {renderPrices()}
        </div>
      }
    </div>
  );
}