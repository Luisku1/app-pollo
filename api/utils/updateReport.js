import BranchReport from "../models/accounts/branch.report.model.js"

export const updateReportIncomes = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDay = date.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(date)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')

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

      branchReport.incomes += amount
      branchReport.balance += amount

      branchReport.save()
    }
  }
}

export const updateReportOutgoings = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDay = date.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(date)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')

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

      branchReport.outgoings += amount
      branchReport.balance += amount

      branchReport.save()
    }
  }
}

export const updateReportInputs = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDay = date.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(date)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')

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

      branchReport.inputs += amount
      branchReport.balance -= amount

      branchReport.save()
    }
  }
}

export const updateReportOutputs = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDay = date.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(date)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')

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

      branchReport.outputs += amount
      branchReport.balance += amount

      branchReport.save()
    }
  }
}

export const updateReportProviderInputs = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDay = date.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(date)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')

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

      branchReport.inputs += amount
      branchReport.balance -= amount

      branchReport.save()
    }
  }
}

export const updateReportStock = async (branch, reportDate, amount) => {

  const date = new Date(reportDate)

  const actualLocaleDay = date.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(date)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')

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

      branchReport.finalStock += amount
      branchReport.balance += amount

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

      nextBranchReport.initialStock += amount
      nextBranchReport.balance -= amount

      await nextBranchReport.save()
    }
  }
}