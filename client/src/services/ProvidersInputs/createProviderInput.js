export const createProviderInputFetch = async ({ providerInput, selectedGroup }) => {

  const group = selectedGroup == 'Sucursales' ? 'branch' : 'customer'

  const res = await fetch(`/api/input/${group}/create-provider-input`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      weight: providerInput.weight,
      pieces: providerInput.pieces,
      product: providerInput.product.value,
      employee: providerInput.employee._id,
      branch: providerInput.branch.value,
      company: providerInput.company,
      comment: providerInput.comment,
      createdAt: providerInput.createdAt
    })
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se registró la entrada de proveedor");

  }

}