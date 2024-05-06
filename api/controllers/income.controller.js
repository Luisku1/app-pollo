import IncomeCollected from "../models/accounts/incomes/income.collected.model.js";
import IncomeType from "../models/accounts/incomes/income.type.model.js";
import { errorHandler } from "../utils/error.js";

export const newIncome = async (req, res, next) => {

  const {incomeAmount, company, branch, employee, type} = req.body
  const createdAt = new Date().toISOString()

  try {

    const newIncome = await new IncomeCollected({amount: incomeAmount, company, branch, employee, type, createdAt})
    newIncome.save()

    res.status(201).json({message: 'New income created successfully', income: newIncome})

  } catch (error) {

    next(error)
  }
}

export const newIncomeType = async (req, res, next) => {

  const name = req.body.name

  try {

    const newType = new IncomeType({name})
    newType.save()

    res.status(201).json({message: 'New type created successfully', type: newType})

  } catch (error) {

    next(error)
  }
}

export const getBranchIncomes = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const actualLocaleDay = date.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(date)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')

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
    }).populate({path: 'employee', select: 'name lastName'}).populate({path: 'branch', select: 'branch'}).populate({path: 'type', select: 'name'})

    if (branchIncomes.length > 0) {

      res.status(200).json({branchIncomes: branchIncomes})

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

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')

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
    }).populate({path: 'employee', select: 'name lastName'}).populate({path: 'branch', select: 'branch position'}).populate({path: 'type', select: 'name'})

    if (incomes.length > 0) {

      res.status(200).json({incomes: incomes})

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

      res.status(200).json({incomeTypes: incomeTypes})

    } else {

      next(errorHandler(404, 'Not income types found'))
    }

  } catch (error) {

    next(error)
  }
}

export const deleteIncome = async (req, res, next) => {

  const incomeId = req.params.incomeId

  try {

    const deleted = await IncomeCollected.findByIdAndDelete({_id: incomeId})

    if(deleted._id) {

      res.status(200).json('Income deleted successfully')

    } else {

      next(errorHandler(404, 'Income not found'))
    }

  } catch (error) {

    next(error)
  }
}