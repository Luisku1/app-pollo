export const getProvidersInputs = async ({companyId, productId, date}) => {

  const res = await fetch('/api/input/get-provider-inputs/' + companyId + '/' + productId + '/' + date)
  const data = await res.json()

  if(data.success === false) {

    throw new Error("No se encontraron entradas de proveedores");

  }

  return {providerInputs: data.providerInputs, providerInputsWeight: data.providerInputsWeight, providerInputsPieces: data.providerInputsPieces}
}