import BranchReport from '../models/accounts/branch.report.model.js'
import ReportData from '../models/accounts/report.data.model.js'
import EmployeeDailyBalance from '../models/employees/employee.daily.balance.js'
import { errorHandler } from '../utils/error.js'
import { getDayRange } from '../utils/formatDate.js'

export const createBranchReport = async (req, res, next) => {

  const companyId = req.params.companyId
  const { initialStock, finalStock, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, date } = req.body
  const inputBalance = initialStock + inputs
  const outputBalance = outgoings + outputs + incomes + finalStock
  const balance = outputBalance - inputBalance
  const createdAt = new Date(date)

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

        const newBranchReport = new BranchReport({ initialStock, finalStock, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, balance, createdAt, reportData: reportData._id })

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
        const newBranchReport = new BranchReport({ initialStock, finalStock, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, balance, createdAt, reportData: newReportData._id })

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
  const date = req.params.date

  try {

    const branchReport = await fetchBranchReport(branchId, date)

    if (branchReport) {

      res.status(200).json({ branchReport })

    } else {

      next(errorHandler(404, 'No branch report found'))
    }

  } catch (error) {

    next(error)
  }
}

export const fetchBranchReport = async (branchId, reportDate) => {

  const { bottomDate, topDate } = getDayRange(new Date(reportDate))

  try {

    const branchReport = await BranchReport.findOne({
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
          branch: branchId
        }
      ]
    })

    if (branchReport != null && branchReport != undefined) {

      if (Object.keys(branchReport).length != 0) {

        return branchReport
      }
    }

  } catch (error) {

    console.log(error)
  }
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

