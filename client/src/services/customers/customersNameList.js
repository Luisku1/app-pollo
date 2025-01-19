export const getCustomersNameList = async ({ companyId }) => {

  const res = await fetch('/api/customer/get/' + companyId)
  const data = await res.json()

  if (data.success === false) {

    return []
  }

  return data.customers
}