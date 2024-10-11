import mongoose from "mongoose";
import IncomeCollected from "../models/accounts/incomes/income.collected.model.js";
import IncomeType from "../models/accounts/incomes/income.type.model.js";
import { errorHandler } from "../utils/error.js";
import { getDayRange } from "../utils/formatDate.js";
import { updateReportIncomes } from "../utils/updateReport.js";
import { addRecordToBranchReportArrays, createDefaultBranchReport, fetchBranchReport, removeRecordFromBranchReport } from "./branch.report.controller.js";
import BranchReport from "../models/accounts/branch.report.model.js";
import { updateDailyBalancesBalance, updateEmployeeDailyBalancesBalance } from "./employee.controller.js";

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

  let branchReport = null
  let income = null
  let updatedEmployeeDailyBalance = null
  let updatedBranchReport = null

  try {

    branchReport = await fetchBranchReport({ branchId: branch, date: createdAt })

    if (!branchReport) {

      branchReport = createDefaultBranchReport({ branchId: branch, date: createdAt, companyId: company })
    }

    if (!branchReport) throw new Error("No se encontró ni se pudo crear el reporte");

    income = await IncomeCollected.create({ amount, company, branch, employee, type, createdAt, partOfAPayment })

    if (!income) throw new Error("No se logró crear el registro");

    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {

      $push: { incomesArray: income._id },
      $inc: { incomes: income.amount, balance: income.amount }

    }, { new: true })

    if (updatedBranchReport) {

      if (updatedBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: updatedBranchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

      return income

    } else {

      throw new Error("Hubo un problema encontrando el reporte a modificar");
    }

  } catch (error) {

    if (income) {

      await IncomeCollected.findByIdAndDelete(income._id)
    }

    if (!updatedEmployeeDailyBalance && updatedBranchReport
      && (branchReport.balance != updatedBranchReport.balance
        || branchReport.incomesArray != updatedBranchReport.incomesArray
        || branchReport.incomes != updatedBranchReport.incomes
      )) {

      await BranchReport.findByIdAndUpdate(branchReport._id, { balance: branchReport.balance, incomes: branchReport.incomes, incomesArray: branchReport.incomesArray })
    }

    throw error;
  }
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

  const branchIncomes = await IncomeCollected.find({

    createdAt: { $gte: bottomDate, $lt: topDate },
    branch: branchId
  }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'branch', select: 'branch' }).populate({ path: 'type', select: 'name' })

  return branchIncomes.length > 0 ? branchIncomes : []
}

export const getIncomes = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const incomes = await IncomeCollected.find({
      createdAt: { $gte: bottomDate, $lt: topDate },
      company: companyId
    }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'type', select: 'name' })

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
  let branchReport = null
  let updatedEmployeeDailyBalance = null
  let updatedBranchReport = null

  try {

    deletedIncome = await IncomeCollected.findByIdAndDelete(incomeId)

    if (!deletedIncome) throw new Error("No se eliminó el registro");

    branchReport = await fetchBranchReport({ branchId: deletedIncome.branch, date: deletedIncome.createdAt })

    if (!branchReport) throw new Error("No se encontró ningún reporte ");

    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {

      $pull: { incomesArray: deletedIncome._id },
      $inc: { incomes: -deletedIncome.amount, balance: -deletedIncome.amount }

    }, { new: true })

    if (updatedBranchReport) {

      if (updatedBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: updatedBranchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

      return deletedIncome

    } else {

      throw new Error("No se pudo actualizar la cuenta, verifique el error");

    }

  } catch (error) {

    if (deletedIncome) {

      await IncomeCollected.create({ deletedIncome })
    }

    if (!updatedEmployeeDailyBalance && updatedBranchReport
      && (branchReport.balance != updatedBranchReport.balance
        || branchReport.incomesArray != updatedBranchReport.incomesArray
        || branchReport.incomes != updatedBranchReport.incomes
      )) {

      await BranchReport.findByIdAndUpdate(branchReport._id, { balance: branchReport.balance, incomes: branchReport.incomes, incomesArray: branchReport.incomesArray })
    }

    throw error
  }
}