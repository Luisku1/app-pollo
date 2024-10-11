export const deleteExtraOutgoingFetch = async ({extraOutgoingId}) => {

  const res = await fetch('/api/outgoing/extra-outgoing/delete/' + extraOutgoingId, {

    method: 'DELETE'

  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }
}