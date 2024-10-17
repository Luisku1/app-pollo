export const addMoneyDeliveredFetch = async ({ supervisorId, companyId, amount, date }) => {

  const res = await fetch('/api/report/supervisor-report/add-money-delivered', {

    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ supervisorId, companyId, amount, date })
  })

  const data = await res.json()

  if(data.success === false) {

    throw new Error(data.message);

  }

  return {updatedSupervisorReport: data.updatedSupervisorReport}
}