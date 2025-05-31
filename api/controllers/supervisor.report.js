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

      res.status(200).json({ data: supervisorReports[0].reports })

    } else {

      next(errorHandler(404, 'Not employee reports found'))
    }

  } catch (error) {

    next(error)
  }
}

export const recalculateSupervisorReport = async (req, res, next) => {

  const { reportId } = req.params

  try {

    const supervisorReport = await fetchFullSupervisorReport(reportId)

    if (!supervisorReport) throw new Error("No se encontró el reporte de supervisor");

    const extraOutgoings = supervisorReport.extraOutgoingsArray.reduce((acc, extraOutgoing) => acc + extraOutgoing.amount, 0)
    const incomes = supervisorReport.incomesArray.reduce((acc, income) => acc + income.amount, 0)
    const verifiedCash = supervisorReport.verifiedCash
    const verifiedDeposits = supervisorReport.verifiedDeposits

    const balance = (incomes - extraOutgoings - verifiedCash - verifiedDeposits) * -1

    const updatedSupervisorReport = await SupervisorReport.findByIdAndUpdate(
      supervisorReport._id,
      { balance },
      { new: true }
    )

    if (!updatedSupervisorReport) throw new Error("No se pudo actualizar el reporte de supervisor")

    const supervisorReportAggregated = await fetchSupervisorReportAggregate(reportId)

    res.status(200).json({
      data: supervisorReportAggregated,
      message: "Se recalculó el reporte de supervisor",
      success: true
    })

  } catch (error) {

    next(error)
  }
}

export const fetchSupervisorReportAggregate = async (reportId) => {
  try {
    const supervisorReport = await SupervisorReport.aggregate([
      { $match: { _id: new Types.ObjectId(reportId) } }, {
        $lookup: {
          from: 'employees',
          localField: 'supervisor',
          foreignField: '_id',
          as: 'supervisor',
          pipeline: [
            {
              $lookup: {
                from: 'roles',
                localField: 'role',
                foreignField: '_id',
                as: 'role'
              }
            },
            { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                password: 0
              }
            }
          ]
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
    ])
    return supervisorReport[0] ? supervisorReport[0] : null
  } catch (error) {
    throw new Error(error)
  }
}

export const setBalanceOnZero = async (req, res, next) => {

  const { reportId } = req.params

  try {


    const updatedSupervisorReport = await SupervisorReport.findByIdAndUpdate(
      reportId,
      { balance: 0 },
      { new: true }
    )

    if (!updatedSupervisorReport) throw new Error("No se pudo actualizar el reporte de supervisor")

    res.status(200).json({
      data: updatedSupervisorReport,
      message: "Se actualizó el reporte de supervisor",
      success: true
    })

  } catch (error) {

    next(error)
  }
}

export const fetchFullSupervisorReport = async (supervisorReportId, supervisorId = null, date = null) => {

  const { bottomDate, topDate } = date ? getDayRange(date) : { bottomDate: null, topDate: null }

  const match = supervisorReportId ? { _id: new Types.ObjectId(supervisorReportId) } : {
    createdAt: { $lt: topDate, $gte: bottomDate },
    supervisor: new Types.ObjectId(supervisorId)
  }

  try {

    const supervisorReport = await SupervisorReport.aggregate([
      { $match: match },
      {
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
      {
        $lookup: {
          from: 'incomecollecteds',
          localField: 'incomesArray',
          foreignField: '_id',
          as: 'incomesArray',
          pipeline: [
            {
              $lookup: {
                from: 'employees',
                localField: 'employee',
                foreignField: '_id',
                as: 'employee'
              }
            },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'incometypes',
                localField: 'type',
                foreignField: '_id',
                as: 'type'
              }
            },
            { $unwind: { path: '$type', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'employeepayments',
                localField: '_id',
                foreignField: 'income',
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
            }
          ]
        }
      }
    ])

    return supervisorReport[0] ? supervisorReport[0] : null

  } catch (error) {

    throw new Error(error)
  }
}

export const fetchSupervisorReportWithIncomes = async (supervisorReportId, supervisorId = null, date = null) => {

  const { bottomDate, topDate } = date ? getDayRange(date) : { bottomDate: null, topDate: null }

  const match = supervisorReportId ? { _id: new Types.ObjectId(supervisorReportId) } : {
    createdAt: { $lt: topDate, $gte: bottomDate },
    supervisor: new Types.ObjectId(supervisorId)
  }

  try {

    const supervisorReport = await SupervisorReport.aggregate([
      { $match: match },
      {
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
    ])

    return supervisorReport[0] ? supervisorReport[0] : null

  } catch (error) {

    throw new Error(error)
  }
}