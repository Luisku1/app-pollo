export const getBranchCustomerProductPrice = async ({ branchCustomerId, productId, date, group }) => {

  const temp = group == 'Sucursales' ? 'branch' : 'customer'

  const res = await fetch(`/api/product/price/get-${temp}-product-price/${branchCustomerId}/${productId}/${date}`)
  const data = await res.json()

  if(data.success === false) {

    throw new Error(data.message);

  }

  return data.price
}