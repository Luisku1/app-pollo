export const getInputs = async ({ companyId, date }) => {

  const res = await fetch('/api/input/get-inputs/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    return { inputs: [] }

  }

  return { inputs: data.data }
}