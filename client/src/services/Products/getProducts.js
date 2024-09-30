export const getProductsFetch = async ({ companyId }) => {

  const res = await fetch('/api/product/get-products/' + companyId)
  const data = await res.json()

  if (data.success === false) {

    return []
  }

  const products = data.products.map((product) => {

    const { name: label, _id : value, ...rest } = product
    const newProduct = { label, value, ...rest }

    return newProduct

  })

  return products
}