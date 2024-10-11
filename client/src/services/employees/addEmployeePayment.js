export const addEmployeePaymentFetch = async ({ employeePayment }) => {

  const res = await fetch('/api/employee/employee-payment/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(employeePayment)
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }

  return { employeePayment: data.employeePayment, income: data.income, extraOutgoing: data.extraOutgoing }
}