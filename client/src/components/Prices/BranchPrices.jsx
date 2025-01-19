/* eslint-disable react/prop-types */

import ChangeBranchPrices from "./ChangeBranchPrices"

export default function BranchPrices({ prices, pricesDate, branch, onChange, onUpdateBranchReport, date }) {

  const isEmpty = !prices || prices.length === 0;

  const renderProductPrice = (price, index) => {
    return (
      <li
        key={price.priceId}
        className={`flex justify-between gap-2 p-2 mt-1 shadow-sm ${index % 2 === 0 ? "bg-gray-100" : "bg-white"
          } border-b border-gray-300`}
      >
        <span className="truncate">{price.product}:</span>
        <span>{price.latestPrice}</span>
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
    <div className="p-4 border rounded-lg shadow-md">
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