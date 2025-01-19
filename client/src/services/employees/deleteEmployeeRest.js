export const deleteEmployeeRestFetch = async (employeeRestId) => {

  const res = await fetch('/api/employee/delete-employee-rest/' + employeeRestId, {
    method: 'DELETE'
  })
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }
}