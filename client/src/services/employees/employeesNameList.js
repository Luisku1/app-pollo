export const getEmployeesNameList = async ({ companyId, date = (new Date()).toISOString() }) => {

  const res = await fetch('/api/employee/get/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    return []
  }

  return data.employees
}