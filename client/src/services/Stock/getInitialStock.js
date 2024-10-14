export const getInitialStockFetch = async ({ branchId, date }) => {


  const res = await fetch('/api/stock/get-initial-stock/' + branchId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error("Algo salió mal consultando el sobrante inicial");
  }

  return {initialStock: data.initialStock}
}