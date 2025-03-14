export const getAllEmployees = async ({companyId, date = (new Date()).toISOString()}) => {

  const res = await fetch('/api/employee/get-all-employees/' + companyId + '/' + date)
  const data = await res.json()

  if(data.success === false) {

    return []
  }

  return data.employees
}