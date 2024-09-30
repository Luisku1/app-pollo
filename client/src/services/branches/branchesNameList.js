export const getBranchesNameList = async ({ companyId }) => {

  const res = await fetch('/api/branch/get-branches/' + companyId)
  const data = await res.json()

  if (data.success === false) {

    return []
  }

  const branches = []

  data.branches.map((branch) => {

    const option = {

      value: branch._id,
      label: branch.branch
    }

    branches.push(option)
  })

  return branches
}