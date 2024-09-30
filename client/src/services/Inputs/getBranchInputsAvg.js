export const getBranchInputsAvgFetch = async ({ branchId }) => {

  const res = await fetch(`/api/input/get-branch-inputs-avg/${branchId}`)
  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se encontraron datos");
  }

  return { branchInputsAvg: data.branchInputsAvg }
}