export const addPreOrderFetch = async ({preOrder}) => {

  const res = await fetch('/api/pre-order/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(preOrder)
  })

  const data = await res.json()

  if(data.success === false) {

    throw new Error(data.message);
  }

  return {data}
}