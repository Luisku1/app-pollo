export const changeActiveStatus = async ({ employeeId, newStatus }) => {

  const res = await fetch('/api/employee/change-active-status/' + employeeId, {

    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({

      newStatus: newStatus
    })
  })

  const data = await res.json()

  if(data.success === false) {

    throw new Error("No se pudo cambiar el valor del estado");

  }

  return data.updatedEmployee
}