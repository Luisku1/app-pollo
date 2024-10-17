import { Types } from "mongoose"
import SupervisorReport from "../models/accounts/supervisor.report.model.js"
import { getDayRange } from "../utils/formatDate.js"

export const getSupervisorReport = async (req, res, next) => {

  const { supervisorId, date } = req.params
  const { bottomDate, topDate } = getDayRange(date)

  try {

    const supervisorReport = await SupervisorReport.findOne({
      createdAt: { $lt: topDate, $gte: bottomDate },
      supervisor: new Types.ObjectId(supervisorId)
    })

    if(!supervisorReport) throw new Error("No se encontró el reporte de supervisor");

    res.status(201).json({supervisorReport})

  } catch (error) {

    next(error)
  }
}