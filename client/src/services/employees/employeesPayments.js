export const getEmployeesPaymentsFetch = async ({ companyId, date }) => {

  const res = await fetch('/api/employee/get-employees-payments/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }

  return { employeesPayments: data.employeesPayments, totalEmployeesPayments: data.totalEmployeesPayments }
}