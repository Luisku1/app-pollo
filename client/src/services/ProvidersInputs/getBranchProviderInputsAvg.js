export const getBranchProviderInputsAvgFetch = async ({ branchId }) => {

  const res = await fetch(`/api/input/get-branch-provider-inputs-avg/${branchId}`)
  const data = await res.json()

  if(data.success === false) {

    throw new Error("No se encontraron datos");
  }

  return {branchProviderInputsAvg: data.branchProviderInputsAvg}
}