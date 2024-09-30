export const getInputs = async ({ companyId, date }) => {

  const res = await fetch('/api/input/get-inputs/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);

  }

  return { inputs: data.inputs, totalWeight: data.totalWeight }
}