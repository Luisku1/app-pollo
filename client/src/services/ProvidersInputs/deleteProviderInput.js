export const deleteProviderInputFetch = async ({ providerInputId }) => {

  const res = await fetch('/api/input/delete-provider-input/' + providerInputId, {

    method: 'DELETE'
  })
  const data = await res.json()

  if (data.success === false) {

    throw new Error("La entrada de proveedor no fueborrada");

  }

  return
}