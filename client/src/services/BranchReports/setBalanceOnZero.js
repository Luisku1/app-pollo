export const setBalanceOnZero = async (reportId) => {

  const res = await fetch(`/api/branch/report/set-balance-on-zero/${reportId}`, {

    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }

  return data.data
}