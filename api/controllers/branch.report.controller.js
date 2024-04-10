import BranchReport from '../models/accounts/branch.report.model.js'
import ReportData from '../models/accounts/report.data.model.js'
import EmployeeDailyBalance from '../models/employees/employee.daily.balance.js'
import { errorHandler } from '../utils/error.js'
import { getProductPrice } from './price.controller.js'

export const createBranchReport = async (req, res, next) => {

  const companyId = req.params.companyId
  const { initialStock, finalStock, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, initialInput } = req.body
  const initialInputPrice = await getProductPrice('65f5f1666199f6bd4cb9b960', branch)
  const initialInputAmount = initialInput * initialInputPrice
  const inputBalance = initialStock + inputs + initialInputAmount
  const outputBalance = outgoings + outputs + incomes + finalStock
  const balance = outputBalance - inputBalance
  const createdAt = new Date().toISOString()

  const actualLocaleDate = new Date(new Date().getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')

  try {

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
    }, { lostMoney: balance })

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

      const updated = await ReportData.updateOne({ _id: reportData._id },
        { $set: { incomes: (reportData.incomes + newBranchReport.incomes), stock: (reportData.stock + newBranchReport.finalStock), outgoings: (reportData.outgoings + newBranchReport.outgoings) } }
      )

      if (updated.acknowledged) {

        const newBranchReport = new BranchReport({ initialStock, finalStock, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, balance, createdAt, reportData: reportData._id, initialInputAmount, initialInputWeight: initialInput })



        await newBranchReport.save()
        console.log(newBranchReport)
        res.status(201).json({ branchReport: newBranchReport, message: 'Report data updated' })


      } else {

        await newBranchReport.save()
        res.status(201).json({ branchReport: newBranchReport })
      }


    } else {

      const newReportData = await new ReportData({ company: companyId, outgoings: newBranchReport.outgoings, stock: newBranchReport.finalStock, incomes: newBranchReport.incomes })

      await newReportData.save()

      await newBranchReport.save()

      await BranchReport.updateOne({ _id: newBranchReport._id }, { $set: { 'reportData': newReportData._id } })

      res.status(201).json({ branchReport: newBranchReport, reportData: newReportData })
    }

  } catch (error) {

    next(error)
  }
}

export const deleteReport = async (req, res, next) => {

  const reportId = req.params.reportId

  try {

    const deleted = await BranchReport.findOneAndDelete({ _id: reportId })

    if (deleted) {

      console.log(deleted)

      const reportData = await ReportData.findOne({_id: deleted.reportData})

      console.log(reportData)

      await ReportData.updateOne({_id: reportData}, {$set: { incomes: (reportData.incomes - deleted.incomes), stock: (reportData.stock - deleted.finalStock), outgoings: (reportData.outgoings - deleted.outgoings) }})

      res.status(200).json('Report deleted successfully')

    } else {

      next(errorHandler(404, 'Not report found'))
    }

  } catch (error) {

    next(error)
  }
}

