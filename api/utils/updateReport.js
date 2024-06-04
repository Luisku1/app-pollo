import BranchReport from "../models/accounts/branch.report.model.js"

export const updateReportIncomes = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDatePlusOne = new Date(date.toLocaleDateString('en-us'))

  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)

  const bottomDate = new Date(date.toLocaleDateString('en-us'))
  const topDate = new Date(actualLocaleDatePlusOne)

  const branchReport = await BranchReport.findOne({

    $and: [
      {
        branch: branch
      },
      {
        createdAt: {

          $lt: topDate
        }
      },
      {
        createdAt: {

          $gte: bottomDate
        }
      }
    ]
  })

  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.incomes += parseFloat(amount)
      branchReport.balance += parseFloat(amount)

      await branchReport.save()
    }
  }
}

export const updateReportOutgoings = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDatePlusOne = new Date(date.toLocaleDateString('en-us'))

  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)

  const bottomDate = new Date(date.toLocaleDateString('en-us'))
  const topDate = new Date(actualLocaleDatePlusOne)

  const branchReport = await BranchReport.findOne({

    $and: [
      {
        branch: branch
      },
      {
        createdAt: {

          $lt: topDate
        }
      },
      {
        createdAt: {

          $gte: bottomDate
        }
      }
    ]
  })

  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.outgoings += parseFloat(amount)
      branchReport.balance += parseFloat(amount)

      branchReport.save()
    }
  }
}

export const updateReportInputs = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDatePlusOne = new Date(date.toLocaleDateString('en-us'))

  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)

  const bottomDate = new Date(date.toLocaleDateString('en-us'))
  const topDate = new Date(actualLocaleDatePlusOne)

  const branchReport = await BranchReport.findOne({

    $and: [
      {
        branch: branch
      },
      {
        createdAt: {

          $lt: topDate
        }
      },
      {
        createdAt: {

          $gte: bottomDate
        }
      }
    ]
  })

  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.inputs += parseFloat(amount)
      branchReport.balance -= parseFloat(amount)

      branchReport.save()
    }
  }
}

export const updateReportOutputs = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDatePlusOne = new Date(date.toLocaleDateString('en-us'))

  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)

  const bottomDate = new Date(date.toLocaleDateString('en-us'))
  const topDate = new Date(actualLocaleDatePlusOne)

  const branchReport = await BranchReport.findOne({

    $and: [
      {
        branch: branch
      },
      {
        createdAt: {

          $lt: topDate
        }
      },
      {
        createdAt: {

          $gte: bottomDate
        }
      }
    ]
  })
  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.outputs += parseFloat(amount)
      branchReport.balance += parseFloat(amount)

      branchReport.save()
    }
  }
}

export const updateReportProviderInputs = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDatePlusOne = new Date(date.toLocaleDateString('en-us'))

  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)

  const bottomDate = new Date(date.toLocaleDateString('en-us'))
  const topDate = new Date(actualLocaleDatePlusOne)

  const branchReport = await BranchReport.findOne({

    $and: [
      {
        branch: branch
      },
      {
        createdAt: {

          $lt: topDate
        }
      },
      {
        createdAt: {

          $gte: bottomDate
        }
      }
    ]
  })

  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.inputs += parseFloat(amount)
      branchReport.balance -= parseFloat(amount)

      branchReport.save()
    }
  }
}

export const updateReportStock = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDatePlusOne = new Date(date.toLocaleDateString('en-us'))

  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)

  const bottomDate = new Date(date.toLocaleDateString('en-us'))
  const topDate = new Date(actualLocaleDatePlusOne)

  const branchReport = await BranchReport.findOne({

    $and: [
      {
        branch: branch
      },
      {
        createdAt: {

          $lt: topDate
        }
      },
      {
        createdAt: {

          $gte: bottomDate
        }
      }
    ]
  })

  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.finalStock += parseFloat(amount)
      branchReport.balance += parseFloat(amount)

      await branchReport.save()
    }
  }

  bottomDate.setDate(bottomDate.getDate() + 1)
  topDate.setDate(topDate.getDate() + 1)

  const nextBranchReport = await BranchReport.findOne({

    $and: [
      {
        branch: branch
      },
      {
        createdAt: {

          $lt: topDate
        }
      },
      {
        createdAt: {

          $gte: bottomDate
        }
      }
    ]
  })

  if (nextBranchReport != null || nextBranchReport != undefined) {

    if (Object.getOwnPropertyNames(nextBranchReport).length != 0) {

      nextBranchReport.initialStock += parseFloat(amount)
      nextBranchReport.balance -= parseFloat(amount)

      await nextBranchReport.save()
    }
  }
}