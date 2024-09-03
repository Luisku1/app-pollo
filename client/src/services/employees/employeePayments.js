export const getEmployeePayments = async ({ employeeId, date }) => {

  const res = await fetch('/api/employee/get-employee-payments/' + employeeId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    return null
  }

  return data
}