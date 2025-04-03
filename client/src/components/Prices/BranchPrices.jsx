/* eslint-disable react/prop-types */

import { currency } from "../../helpers/Functions";
import ChangeBranchPrices from "./ChangeBranchPrices"

export default function BranchPrices({ prices, pricesDate, branch, onChange, onUpdateBranchReport, date }) {

  const isEmpty = !prices || prices.length === 0;

  const renderProductPrice = (price, index) => {
    return (
      <li
        key={price.priceId}
        className={`flex justify-between gap-2 p-1 mt-1 shadow-sm ${index % 2 === 0 ? "bg-gray-100" : "bg-white"
          } border-b border-gray-300`}
      >
        <span className="truncate font-semibold">{price.product}:</span>
        <span className="text-red-800 font-bold">{currency({amount: price.latestPrice})}</span>
      </li>
    );
  };

  const renderPrices = () => {
    return (
      <ul className="grid grid-cols-2">
        {!isEmpty || !onChange && <li className="col-span-2 my-auto font-bold">Precios:</li>}
        {!isEmpty && prices.map((price, index) => renderProductPrice(price, index))}
      </ul>
    );
  };

  return (
    <div className="p-1 border justify-items-center rounded-lg shadow-md text-lg">
      {onChange ?
        <ChangeBranchPrices onUpdateBranchReport={onUpdateBranchReport} onChange={onChange} branch={branch} date={date} pricesDate={pricesDate}>
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