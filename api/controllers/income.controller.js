import IncomeCollected from "../models/accounts/incomes/income.collected.model.js";
import IncomeType from "../models/accounts/incomes/income.type.model.js";
import { errorHandler } from "../utils/error.js";

export const newIncome = async (req, res, next) => {

  const {incomeAmount, company, branch, employee, type} = req.body
  const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(Date.now() - tzoffset)

  try {

    const newIncome = await new IncomeCollected({amount: incomeAmount, company, branch, employee, type, createdAt: functionalDate})

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

  const tzoffset = (new Date(req.params.date)).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(date - tzoffset)
  const functionalDatePlusOneDay = new Date(date -tzoffset)

  functionalDate.setDate(functionalDate.getDate())
  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  try {

    const branchIncomes = await IncomeCollected.find({

      $and: [{

        createdAt: {

          $gte: functionalDate.toISOString().slice(0, 10)
        }
      },
      {

        createdAt: {

          $lt: functionalDatePlusOneDay.toISOString().slice(0, 10)
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

  const tzoffset = (new Date(req.params.date)).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(date - tzoffset)
  const functionalDatePlusOneDay = new Date(date -tzoffset)

  functionalDate.setDate(functionalDate.getDate())
  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  try {

    const incomes = await IncomeCollected.find({

      $and: [{

        createdAt: {

          $gte: functionalDate.toISOString().slice(0, 10)
        }
      },
      {

        createdAt: {

          $lt: functionalDatePlusOneDay.toISOString().slice(0, 10)
        }

      },
      {
        company: companyId
      }]
    }).populate({path: 'employee', select: 'name lastName'}).populate({path: 'branch', select: 'branch'}).populate({path: 'type', select: 'name'})

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

    console.log(deleted)

    if(deleted._id) {

      res.status(200).json('Income deleted successfully')

    } else {

      next(errorHandler(404, 'Income not found'))
    }

  } catch (error) {

    next(error)
  }
}