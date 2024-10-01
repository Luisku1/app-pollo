import { Types } from 'mongoose'
import BranchReport from '../models/accounts/branch.report.model.js'
import ReportData from '../models/accounts/report.data.model.js'
import EmployeeDailyBalance from '../models/employees/employee.daily.balance.js'
import { errorHandler } from '../utils/error.js'
import { getDayRange } from '../utils/formatDate.js'
import { getStockValue } from './stock.controller.js'

export const createBranchReport = async (req, res, next) => {

  const companyId = req.params.companyId
  const { initialStock, finalStock, inputs, providerInputs, outputs, outgoings, incomes, company, branch, employee, assistant, date } = req.body
  const inputBalance = initialStock + inputs + providerInputs
  const outputBalance = outgoings + outputs + incomes + finalStock
  const balance = outputBalance - inputBalance
  const createdAt = date

  console.log(balance)

  const { bottomDate, topDate } = getDayRange(createdAt)

  try {

    const originalBranchReport = await BranchReport.findOne({
      $and: [
        {
          createdAt: {

            $lt: topDate
          }
        },
        {
          createdAt: {

            $gte: bottomDate
          }
        },
        {
          branch: branch
        }
      ]
    })

    if (!originalBranchReport) {

      await EmployeeDailyBalance.updateOne({

        $and: [
          {
            createdAt: {

              $lt: topDate
            }
          },
          {
            createdAt: {

              $gte: bottomDate
            }
          },
          {
            employee: employee
          }
        ]
      }, { accountBalance: balance })

      const reportData = await ReportData.findOne({
        $and: [
          {
            company: companyId
          },
          {
            createdAt: {
              $gte: bottomDate
            }
          },
          {
            createdAt: {
              $lt: topDate
            }
          }
        ]
      })

      if (reportData) {

        const newBranchReport = new BranchReport({ initialStock, providerInputs, finalStock, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, balance, createdAt, reportData: reportData._id })

        const updated = await ReportData.updateOne({ _id: reportData._id },
          { $set: { incomes: (reportData.incomes + newBranchReport.incomes), stock: (reportData.stock + newBranchReport.finalStock), outgoings: (reportData.outgoings + newBranchReport.outgoings) } }
        )

        if (updated.acknowledged) {

          await newBranchReport.save()
          res.status(201).json({ branchReport: newBranchReport, message: 'Report data updated' })

        } else {

          await newBranchReport.save()
          res.status(201).json({ branchReport: newBranchReport })
        }

      } else {

        const newReportData = await new ReportData({ company: companyId, outgoings: outgoings, stock: finalStock, incomes: incomes })
        const newBranchReport = new BranchReport({ initialStock, finalStock, providerInputs, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, balance, createdAt, reportData: newReportData._id })

        await newReportData.save()

        await newBranchReport.save()

        await BranchReport.updateOne({ _id: newBranchReport._id }, { $set: { 'reportData': newReportData._id } })

        res.status(201).json({ branchReport: newBranchReport, reportData: newReportData })
      }

    } else {

      next(errorHandler(404, 'Report already exists'))
    }

  } catch (error) {

    next(error)
  }
}

export const recalculateBranchReport = async ({ branchId, date }) => {

  const branchReport = await fetchBranchReport({ branchId, date, populate: true })

  if (branchReport) {

    const initialStock = getStockValue(date, branchId, 1, branchReport.dateSent)
    branchReport.initialStock = initialStock

    const incomes = branchReport.incomesArray?.length > 0
      ? branchReport.incomesArray.reduce((total, income) => total + income.amount, 0)
      : 0
    branchReport.incomes = incomes

    const outgoings = branchReport.outgoingsArray?.length > 0
      ? branchReport.outgoingsArray.reduce((total, outgoing) => total + outgoing.amount, 0)
      : 0
    branchReport.outgoings = outgoings

    const inputs = branchReport.inputsArray?.length > 0
      ? branchReport.inputs.reduce((total, input) => total + input.amount, 0)
      : 0
    branchReport.inputs = inputs

    const outputs = branchReport.inputsArray?.length > 0
      ? branchReport.inputsArray.reduce((total, input) => total + input.amount, 0)
      : 0
    branchReport.outputs = outputs

    const providerInputs = branchReport.providerInputsArray?.length > 0
      ? branchReport.providerInputsArray.reduce((total, providerInput) => total + providerInput.amount, 0)
      : 0
    branchReport.providerInputs = providerInputs

    const finalStock = branchReport.providerInputsArray?.length > 0
      ? branchReport.providerInputsArray.reduce((total, providerInput) => total + providerInput.amount, 0)
      : 0
    branchReport.finalStock = finalStock

    const newBalance = ((outgoings, finalStock, outputs, incomes) - (initialStock, inputs, providerInputs))

    branchReport.balance = newBalance

    await branchReport.save()

    return branchReport

  } else {

    return null
  }
}

export const updateBranchReport = async (req, res, next) => {

  const { branchReport, employee, assistant, branch, company, initialStock, finalStock, inputs, outputs, outgoings, incomes } = req.body
  const inputBalance = initialStock + inputs
  const outputBalance = outgoings + outputs + incomes + finalStock
  const balance = outputBalance - inputBalance

  const { bottomDate, topDate } = getDayRange(new Date(branchReport.createdAt))

  try {

    const reportData = await ReportData.findOne({
      $and: [
        {
          createdAt: { $gte: bottomDate }
        },
        {
          createdAt: { $lt: topDate }
        },
        {
          company: branchReport.company
        }
      ]
    })

    if (reportData) {

      const updatedBranchReport = await BranchReport.updateOne({ _id: branchReport._id }, {
        $set: { initialStock: initialStock, finalStock: finalStock, inputs: inputs, outputs: outputs, outgoings: outgoings, incomes: incomes, balance: balance, employee: employee, assistant: assistant }
      })

      if (updatedBranchReport.acknowledged) {

        const updatedEmployeeDailyBalance = await EmployeeDailyBalance.updateOne({

          $and: [
            {
              createdAt: {

                $lt: topDate
              }
            },
            {
              createdAt: {

                $gte: bottomDate
              }
            },
            {
              employee: employee
            }
          ]
        }, { accountBalance: balance })

        const updatedReportData = await ReportData.updateOne({ _id: branchReport.reportData }, {

          $set: { incomes: (reportData.incomes + incomes - branchReport.incomes), stock: (reportData.stock + finalStock - branchReport.finalStock), outgoings: (reportData.outgoings + outgoings - branchReport.outgoings) }
        })

        if (updatedReportData.acknowledged) {

          res.status(200).json('Branch report updated successfully')

        } else {

          next(errorHandler(404, 'An error has ocurred'))
        }
      }
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchReport = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date(req.params.date)

  try {

    const branchReport = await fetchBranchReport({ branchId, date })

    if (branchReport) {

      res.status(200).json({ branchReport })

    } else {

      next(errorHandler(404, 'No branch report found'))
    }

  } catch (error) {

    next(error)
  }
}

export const fetchBranchReport = async ({ branchId, date, populate = false }) => {

  const { bottomDate, topDate } = getDayRange(date)

  try {

    let branchReport = null

    if (populate) {

      branchReport = await BranchReport.findOne({
        $and: [
          {
            createdAt: {

              $lt: topDate
            }
          },
          {
            createdAt: {

              $gte: bottomDate
            }
          },
          {
            branch: new Types.ObjectId(branchId)
          }
        ]
      })
        .populate('finalStockArray')
        .populate('inputsArray')
        .populate('providerInputsArray')
        .populate('outputsArray')
        .populate('outgoingsArray')
        .populate('incomesArray')

    } else {

      branchReport = await BranchReport.findOne({
        $and: [
          {
            createdAt: {

              $lt: topDate
            }
          },
          {
            createdAt: {

              $gte: bottomDate
            }
          },
          {
            branch: new Types.ObjectId(branchId)
          }
        ]
      })
    }

    if (branchReport != null && branchReport != undefined) {

      if (Object.getOwnPropertyNames(branchReport).length > 0) {

        return branchReport
      }
    }

  } catch (error) {

    console.log(error)
  }

  return null
}

export const deleteReport = async (req, res, next) => {

  const reportId = req.params.reportId

  try {

    const deleted = await BranchReport.findOneAndDelete({ _id: reportId })

    if (deleted) {

      const reportData = await ReportData.findOne({ _id: deleted.reportData })

      await ReportData.updateOne({ _id: reportData }, { $set: { incomes: (reportData.incomes - deleted.incomes), stock: (reportData.stock - deleted.finalStock), outgoings: (reportData.outgoings - deleted.outgoings) } })

      res.status(200).json('Report deleted successfully')

    } else {

      next(errorHandler(404, 'Not report found'))
    }

  } catch (error) {

    next(error)
  }
}

