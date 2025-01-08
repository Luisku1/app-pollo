export const deleteIncomeFetch = async (incomeId) => {

  const res = await fetch('/api/income/delete/' + incomeId, {

    method: 'DELETE'
  })

  const data = await res.json()

  if(data.success === false) {

    throw new Error(data.message);

  }
}