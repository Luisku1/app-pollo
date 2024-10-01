export const addStockFetch = async ({ stock }) => {

  const res = await fetch('/api/stock/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(stock)
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se registró el sobrante");

  }

  return {stock: data.stock}

}