export const getEmployeesPayrollFetch = async ({ companyId, date }) => {

  const res = await fetch('/api/employee/get-employees-payroll/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);

  }

  return {employeesPayroll: data.employeesPayroll}
}