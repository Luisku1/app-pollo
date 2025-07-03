export const getBranchPricesFetch = async (branchId, date, pricesDate = null, sortOrder = null, isResidual) => {

  const url = `/api/product/price/get-branch-prices/${branchId}/${date}/${pricesDate || 'null'}/${sortOrder || 'null'}`;

  console.log(isResidual)

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: isResidual ? new URLSearchParams({ residuals: isResidual }) : null,
  });

  const data = await res.json();

  if (data.success === false) {
    throw new Error("No se encontraron precios");
  }

  return { branchPrices: data.branchPrices };
}