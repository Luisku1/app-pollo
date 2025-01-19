export const getBranchPricesFetch = async (branchId, date, pricesDate = null, sortOrder = null) => {

  const url = `/api/product/price/get-branch-prices/${branchId}/${date}/${pricesDate || 'null'}/${sortOrder || 'null'}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const data = await res.json();

  if (data.success === false) {
    throw new Error("No se encontraron precios");
  }

  return { branchPrices: data.branchPrices };
}