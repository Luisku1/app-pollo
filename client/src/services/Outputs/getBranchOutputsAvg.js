export const getBranchOutputsAvgFetch = async ({ branchId }) => {

  const res = await fetch(`/api/output/get-branch-outputs-avg/${branchId}`)
  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se encontraron datos");
  }

  return { branchOutputsAvg: data.branchOutputsAvg }
}