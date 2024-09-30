export const addInputFetch = async ({ input, group }) => {

  console.log(input, group)

  const res = await fetch(`/api/input/${group}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se registró la entrada de producto");

  }

  return data.input
}