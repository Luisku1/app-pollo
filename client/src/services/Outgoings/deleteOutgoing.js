export const deleteOutgoingFetch = async ({ outgoingId }) => {

  const res = await fetch('/api/outgoing/delete/' + outgoingId, {

    method: 'DELETE'

  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se eliminó el gasto");

  }
}