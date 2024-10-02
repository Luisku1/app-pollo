import IncomeCollected from "../models/accounts/incomes/income.collected.model.js";
import IncomeType from "../models/accounts/incomes/income.type.model.js";
import { errorHandler } from "../utils/error.js";
import { getDayRange } from "../utils/formatDate.js";
import { updateReportIncomes } from "../utils/updateReport.js";

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

  const newIncome = new IncomeCollected({ amount, company, branch, employee, type, createdAt, partOfAPayment })
  await newIncome.save()
  await updateReportIncomes(branch, createdAt, amount)
  return newIncome

}

export const newCustomerIncomeQuery = async (req, res, next) => {

  const { amount, company, customer, employee, type, createdAt } = req.body

  try {

    const newIncome = await newCustomerIncomeFunction({ amount, company, customer, employee, type, createdAt })

    res.status(201).json({ message: 'New income created successfully', income: newIncome })

  } catch (error) {

    next(error)
  }
}

export const newCustomerIncomeFunction = async ({ amount, company, customer, employee, type, createdAt, partOfAPayment = false }) => {

  const newIncome = new IncomeCollected({ amount, company, customer, employee, type, createdAt, partOfAPayment })
  await newIncome.save()
  await updateReportIncomes(branch, createdAt, amount)
  return newIncome

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

  return await IncomeType.findOne({ name }, '_id')
}

export const getBranchIncomes = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const branchIncomes = await IncomeCollected.find({

      $and: [{

        createdAt: {

          $gte: bottomDate
        }
      },
      {

        createdAt: {

          $lt: topDate
        }

      },
      {
        branch: branchId
      }]
    }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'branch', select: 'branch' }).populate({ path: 'type', select: 'name' })

    if (branchIncomes.length > 0) {

      res.status(200).json({ branchIncomes: branchIncomes })

    } else {

      next(errorHandler(404, 'Not incomes found'))
    }

  } catch (error) {

    next(error)
  }

}

export const getIncomes = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const incomes = await IncomeCollected.find({

      $and: [{

        createdAt: {

          $gte: bottomDate
        }
      },
      {

        createdAt: {

          $lt: topDate
        }

      },
      {
        company: companyId
      }]
    }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'type', select: 'name' })

    if (incomes.length > 0) {

      let total = 0
      const branchesIncomes = []
      const customersIncomes = []

      incomes.forEach((income) => {

        if(income.branch === undefined) {

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

    const income = await deleteIncome(incomeId)

    if (income._id) {

      await updateReportIncomes(income.branch, income.createdAt, -(income.amount))
      res.status(200).json('Income deleted successfully')

    } else {

      next(errorHandler(404, 'Income not found'))
    }

  } catch (error) {

    next(error)
  }
}

export const deleteIncome = async (incomeId) => {

  const income = await IncomeCollected.findById(incomeId)
  const deleted = await IncomeCollected.deleteOne({ _id: incomeId })

  if (deleted.deletedCount > 0) {

    await updateReportIncomes(income.branch, income.createdAt, -(income.amount))
    return income
  }

  return
}