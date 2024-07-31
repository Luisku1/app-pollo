import BranchReport from '../models/accounts/branch.report.model.js'
import ReportData from '../models/accounts/report.data.model.js'
import EmployeeDailyBalance from '../models/employees/employee.daily.balance.js'
import { errorHandler } from '../utils/error.js'
import { convertTZ, localTimeZone } from '../utils/formatDate.js'

export const createBranchReport = async (req, res, next) => {

  const companyId = req.params.companyId
  const { initialStock, finalStock, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, date } = req.body
  const inputBalance = initialStock + inputs
  const outputBalance = outgoings + outputs + incomes + finalStock
  const balance = outputBalance - inputBalance
  const createdAt = new Date(date).toISOString()

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')

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

  const date = new Date(branchReport.createdAt)

  const actualLocaleDay = date.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')

  try {

    const reportData = await ReportData.findOne({ _id: branchReport.reportData })

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

  const actualLocaleDay = date.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')

  try {

    const originalBranchReport = await fetchBranchReport(branchId, bottomDate)

    if (originalBranchReport) {

      res.status(200).json({ originalBranchReport: originalBranchReport })

    } else {

      next(errorHandler(404, 'No branch report found'))
    }

  } catch (error) {

    next(error)
  }
}

export const fetchBranchReport = async (branchId, reportDate) => {

  console.log(new Date(reportDate))

  const date = convertTZ(reportDate)

  console.log(date)

  const datePlusOne = new Date(date)
  datePlusOne.setDate(datePlusOne.getDate() + 1)

  date.setHours(6,0,0)
  datePlusOne.setHours(6,0,0)
  console.log('----Dates----: ', date, datePlusOne)
  console.log('----ISO Dates----:', date.toISOString(), datePlusOne.toISOString())


  try {

    const branchReport = await BranchReport.findOne({
      $and: [
        {
          createdAt: {

            $lt: datePlusOne.toISOString()
          }
        },
        {
          createdAt: {

            $gte: date.toISOString()
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

