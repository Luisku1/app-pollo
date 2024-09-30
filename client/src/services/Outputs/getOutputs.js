export const getOutputs = async ({ companyId, date }) => {

  const res = await fetch('/api/output/get-outputs/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    return {}
  }

  return { outputs: data.outputs, totalWeight: data.totalWeight }
}