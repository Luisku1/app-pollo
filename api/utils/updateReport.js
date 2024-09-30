import { fetchBranchReport } from "../controllers/branch.report.controller.js"
import { updateEmployeeDailyBalancesBalance } from "../controllers/employee.controller.js"

export const updateReportIncomes = async (branchId, reportDate, amount) => {

  try {

    const branchReport = await fetchBranchReport(branchId, reportDate)

    if (branchReport != null || branchReport != undefined) {

      if (Object.getOwnPropertyNames(branchReport).length != 0) {

        branchReport.incomes += parseFloat(amount)
        branchReport.balance += parseFloat(amount)

        await branchReport.save()

        await updateEmployeeDailyBalancesBalance(branchReport.employee, reportDate, branchReport.balance)
      }
    }

  } catch (error) {

    console.log(error)
  }
}

export const updateReportOutgoings = async (branchId, reportDate, amount) => {

  const branchReport = await fetchBranchReport(branchId, reportDate)

  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.outgoings += parseFloat(amount)
      branchReport.balance += parseFloat(amount)

      await branchReport.save()
      await updateEmployeeDailyBalancesBalance(branchReport.employee, reportDate, branchReport.balance)
    }
  }
}

export const updateReportInputs = async (branchId, reportDate, amount) => {

  const branchReport = await fetchBranchReport(branchId, reportDate)

  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.inputs += parseFloat(amount)
      branchReport.balance -= parseFloat(amount)

      await branchReport.save()
      await updateEmployeeDailyBalancesBalance(branchReport.employee, reportDate, branchReport.balance)
    }
  }
}

export const updateReportOutputs = async (branchId, reportDate, amount) => {

  const branchReport = await fetchBranchReport(branchId, reportDate)

  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.outputs += parseFloat(amount)
      branchReport.balance += parseFloat(amount)

      await branchReport.save()
      await updateEmployeeDailyBalancesBalance(branchReport.employee, reportDate, branchReport.balance)
    }
  }
}

export const updateReportProviderInputs = async (branchId, reportDate, amount) => {

  const branchReport = await fetchBranchReport(branchId, reportDate)

  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.inputs += parseFloat(amount)
      branchReport.balance -= parseFloat(amount)

      await branchReport.save()
      await updateEmployeeDailyBalancesBalance(branchReport.employee, reportDate, branchReport.balance)
    }
  }
}

export const updateReportStock = async (branchId, reportDate, amount) => {

  const branchReport = await fetchBranchReport(branchId, reportDate)

  if (branchReport != null || branchReport != undefined) {

    if (Object.getOwnPropertyNames(branchReport).length != 0) {

      branchReport.finalStock += parseFloat(amount)
      branchReport.balance += parseFloat(amount)

      await branchReport.save()
      await updateEmployeeDailyBalancesBalance(branchReport.employee, reportDate, branchReport.balance)

    }
  }

  const nextReportDate = new Date(reportDate)
  nextReportDate.setDate(nextReportDate.getDate() + 1)

  const nextBranchReport = await fetchBranchReport(branchId, nextReportDate)

  if (nextBranchReport != null || nextBranchReport != undefined) {

    if (Object.getOwnPropertyNames(nextBranchReport).length != 0) {

      nextBranchReport.initialStock += parseFloat(amount)
      nextBranchReport.balance -= parseFloat(amount)

      await nextBranchReport.save()
      await updateEmployeeDailyBalancesBalance(branchReport.employee, nextReportDate, branchReport.balance)

    }
  }
}