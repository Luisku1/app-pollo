import BranchReport from '../models/accounts/branch.report.model.js'

export const createBranchReport = async (req, res, next) => {

  const {initialStock, finalStock, inputs, outputs, outgoings, incomes, company, branch, employee, assistant} = req.body
  const inputBalance = initialStock + inputs
  const outputBalance = outgoings + outputs + incomes + finalStock
  const balance = outputBalance - inputBalance
  const createdAt = new Date().toISOString()
  const newBranchReport = new BranchReport({initialStock, finalStock, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, balance, createdAt})

  try {

    await newBranchReport.save()
    res.status(201).json('Branch report created successfully')

  } catch (error) {

    next(error)
  }
}

