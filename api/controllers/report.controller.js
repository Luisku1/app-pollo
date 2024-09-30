import Role from "../models/role.model.js"
import Employee from "../models/employees/employee.model.js"
import { Types } from "mongoose"
import ExtraOutgoing from "../models/accounts/outgoings/extra.outgoing.model.js"
import IncomeCollected from "../models/accounts/incomes/income.collected.model.js"
import BranchReport from "../models/accounts/branch.report.model.js"
import { errorHandler } from "../utils/error.js"
import ReportData from "../models/accounts/report.data.model.js"
import { getDayRange } from "../utils/formatDate.js"
import Outgoing from "../models/accounts/outgoings/outgoing.model.js"
import Stock from "../models/accounts/stock.model.js"

export const getBranchReports = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const branchReports = await BranchReport.find({

      $and: [
        {
          createdAt: { $gte: bottomDate }
        },
        {
          createdAt: { $lt: topDate }
        },
        {
          company: companyId
        }
      ]
    }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'assistant', select: 'name lastName' })

    if (branchReports.length > 0) {

      res.status(200).json({ branchReports })

    } else {

      next(errorHandler(200, 'No branch reports found'))
    }

  } catch (error) {

    next(error)
  }
}

export const getSupervisorsInfo = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const supervisorsInfo = await supervisorsInfoQuery(companyId, topDate, bottomDate, next)

    if (supervisorsInfo.error == null) {

      res.status(200).json({ supervisorsInfo: supervisorsInfo })

    } else {

      next(errorHandler(404, supervisorsInfo.error))
    }

  } catch (error) {

    next(error)
  }

}

export const getSupervisorInfo = async (req, res, next) => {

  const employeeId = req.params.employeeId

  const { bottomDate, topDate } = getDayRange(new Date())

  const supervisorInfo = {
    incomes: 0.0,
    outgoings: 0.0
  }

  try {

    const outgoings = await ExtraOutgoing.find({

      $and: [
        {
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
          employee: employeeId
        }
      ]
    }, 'amount')

    const incomes = await IncomeCollected.find({

      $and: [
        {
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
          employee: employeeId
        }
      ]
    }, 'amount type').populate({ path: 'type', select: 'name' })

    if (outgoings.length > 0) {

      outgoings.forEach(outgoing => {
        supervisorInfo.outgoings += outgoing.amount
      });

    }

    if (incomes.length > 0) {

      incomes.forEach(income => {
        supervisorInfo.incomes += income.amount
      })
    }
    res.status(200).json({ supervisorInfo: supervisorInfo })

  } catch (error) {

    next(error)
  }
}

export const supervisorsInfoQuery = async (companyId, dateTopRange, dateBottomRange, next) => {

  let supervisorsInfo = []

  try {

    const roles = await Role.find({
      $or: [
        {
          name: 'Gerente'
        },
        {
          name: 'Supervisor'
        }
      ]
    }).select({ path: '_id' })

    const supervisors = await Employee.find({


      role: { $in: roles },
      company: new Types.ObjectId(companyId)

    })

    for (let supervisor in supervisors) {

      let supervisorModel = {
        supervisor: {},
        deposits: 0,
        cash: 0,
        totalIncomes: 0,
        totalExtraOutgoings: 0,
        incomes: [],
        extraOutgoings: []
      }

      supervisorModel.supervisor = supervisors[supervisor]

      supervisorModel.incomes = await IncomeCollected.find({
        $and: [
          {
            createdAt: {

              $gte: dateBottomRange
            }
          },
          {
            createdAt: {

              $lt: dateTopRange
            }
          },
          {
            employee: supervisors[supervisor]._id
          }
        ]
      }).populate({ path: 'branch', select: 'branch' }).populate({ path: 'type', select: 'name' })

      if (supervisorModel.incomes.length > 0) {

        for (let income in supervisorModel.incomes) {

          supervisorModel.totalIncomes += supervisorModel.incomes[income].amount

          if (supervisorModel.incomes[income].type.name == 'Efectivo') {

            supervisorModel.cash += supervisorModel.incomes[income].amount

          } else {

            supervisorModel.deposits += supervisorModel.incomes[income].amount

          }
        }
      }


      supervisorModel.extraOutgoings = await ExtraOutgoing.find({
        $and: [
          {
            createdAt: {

              $gte: dateBottomRange
            }
          },
          {
            createdAt: {

              $lt: dateTopRange
            }
          },
          {
            employee: supervisors[supervisor]._id
          }
        ]
      })

      if (supervisorModel.extraOutgoings.length > 0) {

        for (let extraOutgoing in supervisorModel.extraOutgoings) {

          supervisorModel.totalExtraOutgoings += supervisorModel.extraOutgoings[extraOutgoing].amount
        }
      }

      supervisorsInfo.push(supervisorModel)
    }

    if (supervisorsInfo) {

      return { error: null, data: supervisorsInfo }

    } else {

      return { error: 'Error innesperado', data: null }
    }

  } catch (error) {

    next(error)
  }
}

export const getDaysReportsData = async (req, res, next) => {

  const companyId = req.params.companyId

  try {

    const reportsData = await ReportData.find({ company: companyId }).sort({ createdAt: -1 }).limit(30)

    if (reportsData.length > 0) {

      res.status(200).json({ reportsData: reportsData })

    } else {

      next(errorHandler(404, 'Reports data not found'))
    }

  } catch (error) {

    next(error)
  }
}

export const updateReportDatasInfo = async (req, res, next) => {

  const companyId = req.params.companyId

  try {

    let date = new Date('2024-09-06T01:02:42.309+00:00')

    while (!(date > (new Date()))) {

      const { bottomDate, topDate } = getDayRange(date)
      let outgoingsTotal = 0
      let incomesTotal = 0
      let stockTotal = 0

      const reportData = await ReportData.findOne({
        $and: [
          {
            createdAt: { $lt: topDate }
          },
          {
            createdAt: { $gte: bottomDate }
          },
          {
            company: companyId
          }
        ]
      })


      if (!reportData) {

        date.setDate(date.getDate() + 1)

      } else {


        const outgoings = await Outgoing.find({
          $and: [
            {
              createdAt: { $lt: topDate }
            },
            {
              createdAt: { $gte: bottomDate }
            },
            {
              company: companyId
            }
          ]
        })

        const incomes = await IncomeCollected.find({
          $and: [
            {
              createdAt: { $lt: topDate }
            },
            {
              createdAt: { $gte: bottomDate }
            },
            {
              company: companyId
            }
          ]
        })

        const stock = await Stock.find({
          $and: [
            {
              createdAt: { $lt: topDate }
            },
            {
              createdAt: { $gte: bottomDate }
            },
            {
              company: companyId
            }
          ]
        })

        outgoings.forEach(outgoing => {

          outgoingsTotal += outgoing.amount
        })

        stock.forEach(stock => {

          stockTotal += stock.amount
        })

        incomes.forEach(income => {

          incomesTotal += income.amount
        })

        reportData.incomes = incomesTotal
        reportData.stock = stockTotal
        reportData.outgoings = outgoingsTotal

        reportData.save()

        date.setDate(date.getDate() + 1)
      }
    }

  } catch (error) {

    next(error)
  }
}