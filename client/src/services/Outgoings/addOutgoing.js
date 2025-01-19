export const addOutgoingFetch = async (outgoing) => {

  const res = await fetch('/api/outgoing/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify(outgoing)
  })

  const data = await res.json()

  if (data.success === false) {

    console.log(data.message)
    throw new Error('Fallo al registrar el gasto')
  }

  return data.outgoing
}