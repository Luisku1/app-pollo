export const getAllEmployees = async ({companyId}) => {

  const res = await fetch('/api/employee/get-all-employees/' + companyId)
  const data = await res.json()

  if(data.success === false) {

    return []
  }

  const employees = data.employees.map((employee) => {

    const { name, lastName, _id : value, ...rest } = employee
    const newEmployee = { label: `${name} ${lastName}`, value, ...rest }

    return newEmployee

  })

  return employees
}