export const deleteEmployeePaymentFetch = async ({ employeePaymentId, incomeId, extraOutgoingId }) => {

  console.log(employeePaymentId, incomeId, extraOutgoingId)

  const res = await fetch('/api/employee/delete-employee-payment/' + employeePaymentId + '/' + incomeId + '/' + extraOutgoingId, {

    method: 'DELETE'
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se ha borrado el pago a empleado");
  }
}