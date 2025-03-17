export const getEmployeesNameList = async ({ companyId }) => {

  const res = await fetch('/api/employee/get/' + companyId)
  const data = await res.json()

  if (data.success === false) {

    return []
  }

  return data.employees
}