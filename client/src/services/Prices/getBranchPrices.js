export const getBranchPricesFetch = async ({ branchId, date }) => {

  const res = await fetch('/api/product/price/get-branch-prices/' + branchId + '/' + date)
  const data = await res.json()

  if(data.success === false) {

    throw new Error("No se encontraron precios");
  }

  return {branchPrices: data.branchPrices}
}