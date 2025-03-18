import { Types } from "mongoose"
import SupervisorReport from "../models/accounts/supervisor.report.model.js"
import { getDayRange } from "../utils/formatDate.js"
import { getEmployeeWorkedDays } from "./employee.controller.js"
import { lookupSupervisorReportIncomes } from "./income.controller.js"

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
      }, {
        $lookup: {
          from: 'employees',
          localField: 'supervisor',
          foreignField: '_id',
          as: 'supervisor'
        }
      },
      { $unwind: { path: '$supervisor', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'extraoutgoings',
          localField: 'extraOutgoingsArray',
          foreignField: '_id',
          as: 'extraOutgoingsArray',
          pipeline: [
            { $sort: { "amount": -1 } },
            {
              $lookup: {
                from: 'employeepayments',
                localField: '_id',
                foreignField: 'extraOutgoing',
                as: 'employeePayment',
                pipeline: [
                  {
                    $lookup: {
                      from: 'employees',
                      localField: 'employee',
                      foreignField: '_id',
                      as: 'employee'
                    }
                  },
                  { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } }
                ]
              }
            },
            { $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'employees',
                localField: 'employee',
                foreignField: '_id',
                as: 'employee'
              }
            },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } }
          ]
        }
      },
      lookupSupervisorReportIncomes('Depósito', 'depositsArray'),
      lookupSupervisorReportIncomes('Efectivo', 'cashArray'),
      lookupSupervisorReportIncomes('Terminal', 'terminalIncomesArray'),
      {
        $addFields: {
          extraOutgoings: { $sum: '$extraOutgoingsArray.amount' },
          cash: { $sum: '$cashArray.amount' },
          deposits: { $sum: '$depositsArray.amount' },
          terminalIncomes: { $sum: '$terminalIncomesArray.amount' },
          verifiedCash: '$verifiedCash',
          verifiedDeposits: '$verifiedDeposits',
        }
      },
      {
        $match: {
          $or: [
            { extraOutgoings: { $gt: 0 } },
            { cash: { $gt: 0 } },
            { terminalIncomes: { $gt: 0 } },
            { deposits: { $gt: 0 } },
            { missingIncomes: { $gt: 0 } },
            { verifiedCash: { $gt: 0 } },
            { verifiedDeposits: { $gt: 0 } },
          ]
        }
      },
      {
        $facet: {
          reports: [
            {
              $project: {
                _id: 1,
                extraOutgoings: 1,
                cash: 1,
                deposits: 1,
                supervisor: 1,
                createdAt: 1,
                cashArray: 1,
                depositsArray: 1,
                extraOutgoingsArray: 1,
                terminalIncomes: 1,
                terminalIncomesArray: 1,
                missingIncomes: 1,
                verifiedCash: 1,
                balance: 1,
                verifiedDeposits: 1,
                supervisor: 1
              }
            }
          ],
          globalTotals: [
            {
              $group: {
                _id: null,
                extraOutgoings: { $sum: '$extraOutgoings' },
                cash: { $sum: '$cash' },
                deposits: { $sum: '$deposits' },
                verifiedCash: { $sum: '$verifiedCash' },
                verifiedDeposits: { $sum: '$verifiedDeposits' },
                terminalIncomes: { $sum: '$terminalIncomes' },
                missingIncomes: { $sum: '$balance' },
                cashArray: { $push: '$cashArray' },
                depositsArray: { $push: '$depositsArray' },
                extraOutgoingsArray: { $push: '$extraOutgoingsArray' },
                terminalIncomesArray: { $push: '$terminalIncomesArray' }
              }
            },
            {
              $project: {
                _id: 0,
                extraOutgoings: 1,
                cash: 1,
                deposits: 1,
                verifiedCash: 1,
                verifiedDeposits: 1,
                terminalIncomes: 1,
                missingIncomes: 1,
                cashArray: { $reduce: { input: "$cashArray", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } },
                depositsArray: { $reduce: { input: "$depositsArray", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } },
                terminalIncomesArray: { $reduce: { input: "$terminalIncomesArray", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } },
                extraOutgoingsArray: { $reduce: { input: "$extraOutgoingsArray", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } }
              }
            }
          ]
        }
      }
    ])

    if (supervisorReports.length > 0) {

      res.status(200).json({data: supervisorReports[0].reports})

    } else {

      next(errorHandler(404, 'Not employee reports found'))
    }

  } catch (error) {

    next(error)
  }
}