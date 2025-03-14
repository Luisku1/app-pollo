export const getAllEmployees = async ({companyId}) => {

  const res = await fetch('/api/employee/get-all-employees/' + companyId)
  const data = await res.json()

  if(data.success === false) {

    return []
  }

  return data.employees
}