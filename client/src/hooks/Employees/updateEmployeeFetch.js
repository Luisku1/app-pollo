export const updateEmployeeFetch = async (employeeData) => {

  const employeeId = employeeData._id;
  const res = await fetch('/api/employee/' + employeeId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(employeeData)
  })
  const data = await res.json()

  if (data.success === false) {
    throw new Error(data.message);
  }

  return data.employee;
}
