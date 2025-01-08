export const getProductsFetch = async (companyId) => {

  const res = await fetch('/api/product/get-products/' + companyId)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message)
  }

  return data.products
}