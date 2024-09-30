export const getEmployeesNameList = async ({ companyId }) => {

  const res = await fetch('/api/employee/get/' + companyId)
  const data = await res.json()

  if (data.success === false) {

    return []
  }

  const employees = []

  data.employees.map((employee) => {

    const option = {
      value: employee._id,
      label: employee.name + ' ' + employee.lastName
    }

    employees.push(option)

  })

  return employees
}