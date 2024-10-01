export const getStockFetch = async ({ branchId, date }) => {

  const res = await fetch('/api/stock/get-branch-stock/' + branchId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se encontró sobrante");

  }

  return {stock: data.stock, totalStock: data.totalStock}
}