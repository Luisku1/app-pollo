export const getCustomersNameList = async ({ companyId }) => {

  const res = await fetch('/api/customer/get/' + companyId)
  const data = await res.json()

  if (data.success === false) {

    return []
  }

  const customers = []

  data.customers.map((customer) => {

    const auxCustomerConst = {

      value: customer._id,
      label: customer.name + ' ' + customer.lastName
    }

    customers.push(auxCustomerConst)
  })

  return customers
}