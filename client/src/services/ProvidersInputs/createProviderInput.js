export const createProviderInputFetch = async (providerInput, group) => {

  const res = await fetch(`/api/input/${group}/create-provider-input`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(providerInput)
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se registró la entrada de proveedor");

  }

  return data.providerInput
}