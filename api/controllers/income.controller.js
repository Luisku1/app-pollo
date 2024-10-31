import IncomeCollected from "../models/accounts/incomes/income.collected.model.js";
import IncomeType from "../models/accounts/incomes/income.type.model.js";
import { errorHandler } from "../utils/error.js";
import { getDayRange } from "../utils/formatDate.js";
import { pushOrPullBranchReportRecord } from "./branch.report.controller.js";
import { pushOrPullCustomerReportRecord } from "./customer.controller.js";
import { addSupervisorReportIncome, deleteSupervisorReportIncome } from "./employee.controller.js";

export const newBranchIncomeQuery = async (req, res, next) => {

  const { amount, company, branch, employee, type, createdAt } = req.body

  try {

    const newIncome = await newBranchIncomeFunction({ amount, company, branch, employee, type, createdAt })

    res.status(201).json({ message: 'New income created successfully', income: newIncome })

  } catch (error) {

    next(error)
  }
}

export const newBranchIncomeFunction = async ({ amount, company, branch, employee, type, createdAt, partOfAPayment = false }) => {

  let income = null

  try {

    income = await IncomeCollected.create({ amount, company, branch, employee, type, createdAt, partOfAPayment })

    if (!income) throw new Error("No se logró crear el registro")

    await pushOrPullBranchReportRecord({
      branchId: income.branch,
      date: income.createdAt,
      record: income,
      affectsBalancePositively: true,
      operation: '$addToSet',
      arrayField: 'incomesArray',
      amountField: 'incomes'
    })

    await addSupervisorReportIncome({ income, date: income.createdAt })

    return income

  } catch (error) {

    if (income) {

      await IncomeCollected.findByIdAndDelete(income._id)
    }

    throw error;
  }
}

export const newCustomerIncomeFunction = async ({ amount, company, customer, employee, type, createdAt, partOfAPayment = false }) => {

  let income = null

  try {

    income = await IncomeCollected.create({ amount, company, customer, employee, type, createdAt, partOfAPayment })

    if (!income) throw new Error("No se logró crear el registro")

    await pushOrPullCustomerReportRecord({
      customerId: customer,
      date: income.createdAt,
      record: income,
      affectsBalancePositively: true,
      operation: '$addToSet',
      arrayField: 'paymentsArray',
      amountField: 'paymentsAmount'
    })

    await addSupervisorReportIncome({ income: income, date: income.createdAt })

    return income

  } catch (error) {

    if (income) {

      await IncomeCollected.findByIdAndDelete(income._id)
    }

    throw error
  }
}

export const newCustomerIncomeQuery = async (req, res, next) => {

  const { amount, company, customer, employee, type, createdAt } = req.body

  try {

    const newIncome = await newCustomerIncomeFunction({ amount, company, customer, employee, type, createdAt })

    res.status(201).json({
      message: 'New income created successfully',
      income: newIncome
    })

  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const newIncomeType = async (req, res, next) => {

  const name = req.body.name

  try {

    const newType = new IncomeType({ name })
    newType.save()

    res.status(201).json({ message: 'New type created successfully', type: newType })

  } catch (error) {

    next(error)
  }
}

export const getIncomeTypeId = async ({ name }) => {

  return IncomeType.findOne({ name }, '_id')
}

export const getBranchIncomesRequest = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  try {

    const branchIncomes = await getBranchIncomes({ branchId, date })

    if (branchIncomes.length > 0) {

      res.status(200).json({ branchIncomes: branchIncomes })

    } else {

      next(errorHandler(404, 'Not incomes found'))
    }

  } catch (error) {

    next(error)
  }

}

export const getBranchIncomes = async ({ branchId, date }) => {

  const { bottomDate, topDate } = getDayRange(new Date(date))

  return IncomeCollected.find({

    createdAt: { $gte: bottomDate, $lt: topDate },
    branch: branchId
  }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'branch', select: 'branch' }).populate({ path: 'type', select: 'name' }).sort({ createdAt: -1 })

}

export const getIncomes = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const incomes = await IncomeCollected.find({
      createdAt: { $gte: bottomDate, $lt: topDate },
      company: companyId
    }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'type', select: 'name' }).populate({ path: 'customer', select: 'name lastName' })

    if (incomes.length > 0) {

      let total = 0
      const branchesIncomes = []
      const customersIncomes = []

      incomes.forEach((income) => {

        if (income.branch === undefined) {

          customersIncomes.push(income)

        } else {

          branchesIncomes.push(income)
        }

        total += income.amount
      })

      branchesIncomes.sort((prevIncome, nextIncome) => prevIncome.branch.position - nextIncome.branch.position)

      res.status(200).json({ incomes: [...branchesIncomes, ...customersIncomes], total })

    } else {

      next(errorHandler(404, 'Not incomes found'))
    }

  } catch (error) {

    next(error)
  }
}

export const getIncomeTypes = async (req, res, next) => {

  try {

    const incomeTypes = await IncomeType.find({})

    if (incomeTypes.length > 0) {

      res.status(200).json({ incomeTypes: incomeTypes })

    } else {

      next(errorHandler(404, 'Not income types found'))
    }

  } catch (error) {

    next(error)
  }
}

export const deleteIncomeQuery = async (req, res, next) => {

  const incomeId = req.params.incomeId

  try {

    const deletedIncome = await deleteIncome({ incomeId })

    if (!deletedIncome) throw new Error("Algo ha salido mal");

    res.status(200).json('Registro eliminado')

  } catch (error) {

    next(error);
  }
}

export const deleteIncome = async ({ incomeId }) => {

  let deletedIncome = null

  try {

    deletedIncome = await IncomeCollected.findByIdAndDelete(incomeId)

    if (!deletedIncome) throw new Error("No se eliminó el registro")

    if (deletedIncome.branch) {

      await pushOrPullBranchReportRecord({
        branchId: deletedIncome.branch,
        date: deletedIncome.createdAt,
        record: deletedIncome,
        affectsBalancePositively: true,
        operation: '$pull',
        arrayField: 'incomesArray',
        amountField: 'incomes'
      })

    } else {

      await pushOrPullCustomerReportRecord({
        customerId: deletedIncome.customer,
        date: deletedIncome.createdAt,
        record: deletedIncome,
        affectsBalancePositively: true,
        operation: '$pull',
        arrayField: 'paymentsArray',
        amountField: 'paymentsAmount'
      })
    }

    await deleteSupervisorReportIncome({ income: deletedIncome, date: deletedIncome.createdAt })

    return deletedIncome

  } catch (error) {

    if (deletedIncome) {

      await IncomeCollected.create(deletedIncome)
    }

    throw error
  }
}