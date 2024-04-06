import Role from "../models/role.model.js"
import Employee from "../models/employees/employee.model.js"
import { Types } from "mongoose"
import ExtraOutgoing from "../models/accounts/outgoings/extra.outgoing.model.js"
import IncomeCollected from "../models/accounts/incomes/income.collected.model.js"
import BranchReport from "../models/accounts/branch.report.model.js"
import { errorHandler } from "../utils/error.js"


export const getBranchReports = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const functionalDate = new Date(date)
  const functionalDatePlusOneDay = new Date(date)

  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  const bottomDate = new Date(functionalDate.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')
  const topDate = new Date(functionalDatePlusOneDay.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')

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
    }).populate({ path: 'branch', select: 'branch' })

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

  const functionalDate = new Date(date)
  const functionalDatePlusOneDay = new Date(date)

  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  const bottomDate = new Date(functionalDate.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')
  const topDate = new Date(functionalDatePlusOneDay.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')

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
      })

      if (supervisorModel.incomes.length > 0) {

        for (let income in supervisorModel.incomes) {

          supervisorModel.totalIncomes += supervisorModel.incomes[income].amount
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