export const deleteStockFetch = async (stockId) => {

  const res = await fetch('/api/stock/delete/' + stockId, {

    method: 'DELETE'

  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se pudo eliminar el sobrante");

  }
}