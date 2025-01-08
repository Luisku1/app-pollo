/* eslint-disable react/prop-types */

import ChangeBranchPrices from "./ChangeBranchPrices"

export default function BranchPrices({ prices, pricesDate, branch, onChange }) {

  const isEmpty = prices.length === 0

  const renderProductPrice = (price) => {

    return (
      <div key={price.priceId} className='grid grid-cols-2 bg-white gap-2 p-1 mt-1 shadow-sm'>
        <p className='truncate'>{price.product}:</p>
        <p className=''>{price.latestPrice}</p>
      </div>
    )
  }

  const renderPrices = () => {
    return (
      <div>
        {!isEmpty && prices.map((price) => renderProductPrice(price))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-5'>
      <ChangeBranchPrices
        onChange={onChange}
        branch={branch}
        pricesDate={pricesDate}
      >
        {prices && prices.length > 0 ? <p className='col-span-2 my-auto'>Precios:</p> : ''}
        {renderPrices()}
      </ChangeBranchPrices>
    </div>
  )
}
