export const getBranchesNameList = async ({ companyId }) => {

  const res = await fetch('/api/branch/get-branches/' + companyId)
  const data = await res.json()

  if (data.success === false) {

    return []
  }

  const branches = data.branches

  return branches
}