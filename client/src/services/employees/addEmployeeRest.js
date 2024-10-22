export const addEmployeeRestFetch = async ({ employeeId, replacementId, date, companyId }) => {

  const res = await fetch(`/api/employee/create-employee-rest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ employeeId, replacementId, date, companyId })
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }

  return { newEmployeeRest: data.newEmployeeRest }
}