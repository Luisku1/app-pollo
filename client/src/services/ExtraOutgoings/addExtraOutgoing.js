export const addExtraOutgoingFetch = async ({extraOutgoing}) => {

  const res = await fetch('/api/outgoing/extra-outgoing/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(extraOutgoing)
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }

  return {extraOutgoing: data.extraOutgoing}
}