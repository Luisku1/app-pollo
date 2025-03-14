export const getEmployeePayments = async ({ employeeId, date = (new Date().toISOString()) }) => {

  const res = await fetch('/api/employee/get-employee-payments/' + employeeId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);

  }

  return data
}