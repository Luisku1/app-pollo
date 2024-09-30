export const addOutputFetch = async ({ output, group }) => {

  const res = await fetch(`/api/output/${group}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(output)
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se registró la salida de producto");

  }
}