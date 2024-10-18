import { Types } from "mongoose"
import SupervisorReport from "../models/accounts/supervisor.report.model.js"
import { getDayRange } from "../utils/formatDate.js"
import { getEmployeeWorkedDays } from "./employee.controller.js"

export const getSupervisorReport = async (req, res, next) => {

  const { supervisorId, date } = req.params
  const { bottomDate, topDate } = getDayRange(date)

  try {

    const supervisorReport = await SupervisorReport.findOne({
      createdAt: { $lt: topDate, $gte: bottomDate },
      supervisor: new Types.ObjectId(supervisorId)
    })

    if (!supervisorReport) throw new Error("No se encontró el reporte de supervisor");

    res.status(201).json({ supervisorReport })

  } catch (error) {

    next(error)
  }
}

export const getSupervisorReports = async (req, res, next) => {

  const { supervisorId } = req.params
  const { bottomDate, topDate } = getDayRange(new Date())

  try {

    const employeeWeekDays = await getEmployeeWorkedDays(bottomDate, supervisorId)
    const firstWeekDay = new Date(bottomDate)
    firstWeekDay.setDate(firstWeekDay.getDate() - employeeWeekDays)

    const employeeObjectId = new Types.ObjectId(supervisorId)

    const supervisorReports = await SupervisorReport.aggregate([
      {
        $match: {
          'createdAt': { $gte: new Date(firstWeekDay), $lt: new Date(topDate) },
          'supervisor': employeeObjectId
        }
      },
      {
        $project: {

          _id: 1,
          balance: 1,
          moneyDelivered: 1,
          incomes: 1,
          extraOutgoings: 1,
          supervisor: 1,
          createdAt: 1
        }
      }
    ])

    if (supervisorReports.length > 0) {

      res.status(200).json({ supervisorReports: supervisorReports })

    } else {

      next(errorHandler(404, 'Not employee reports found'))
    }

  } catch (error) {

    next(error)
  }
}