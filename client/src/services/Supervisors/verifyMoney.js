export const verifyMoneyFetch = async ({ typeField, supervisorId, companyId, amount, date }) => {

  const type = typeField.replace("verified", "").toLowerCase()

  const res = await fetch(`/api/report/supervisor-report/verify-${type}`, {

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