import { Types } from "mongoose"
import ExtraOutgoing from "../models/accounts/outgoings/extra.outgoing.model.js"
import IncomeCollected from "../models/accounts/incomes/income.collected.model.js"
import BranchReport from "../models/accounts/branch.report.model.js"
import { errorHandler } from "../utils/error.js"
import { getDayRange } from "../utils/formatDate.js"
import { branchLookup, employeeLookup, unwindBranch, unwindEmployee } from "./branch.report.controller.js"
import { incomesAggregate, lookupSupervisorReportIncomes } from "./income.controller.js"
import SupervisorReport from "../models/accounts/supervisor.report.model.js"
import { employeeAggregate } from "./employee.controller.js"
import { dateFromYYYYMMDD } from "../../common/dateOps.js"
import { extraOutgoingsAggregate } from "./outgoing.controller.js"

export const getBranchReports = async (req, res, next) => {

  const date = dateFromYYYYMMDD(req.params.date)
  const companyId = req.params.companyId
  console.log('getBranchReports', date)

  const { bottomDate, topDate } = getDayRange(date)

  console.log(bottomDate, topDate)

  try {

    const branchReportsAggregate = await BranchReport.aggregate([
      {
        $match: {
          'createdAt': { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          'company': new Types.ObjectId(companyId)
        }
      },
      {
        $lookup: {
          from: 'providerinputs',
          localField: 'providerInputsArray',
          foreignField: '_id',
          as: 'providerInputsArray',
          pipeline: [
            branchLookup,
            unwindBranch,
            {
              $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product',
              },
            },
            {
              $unwind: {
                path: '$product',
                preserveNullAndEmptyArrays: true,
              },
            },
            employeeLookup,
            unwindEmployee
          ],
        },
      },
      {
        $lookup: {
          from: 'inputs',
          localField: 'inputsArray',
          foreignField: '_id',
          as: 'inputsArray',
          pipeline: [
            branchLookup,
            unwindBranch,
            {
              $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product',
              },
            },
            {
              $unwind: {
                path: '$product',
                preserveNullAndEmptyArrays: true,
              },
            },
            employeeLookup,
            unwindEmployee
          ],
        },
      },
      {
        $lookup: {
          from: 'outputs',
          localField: 'outputsArray',
          foreignField: '_id',
          as: 'outputsArray',
          pipeline: [
            branchLookup,
            unwindBranch,
            {
              $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product',
              },
            },
            {
              $unwind: {
                path: '$product',
                preserveNullAndEmptyArrays: true,
              },
            },
            employeeLookup,
            unwindEmployee,
          ],
        },
      },
      {
        $lookup: {
          from: 'outgoings',
          localField: 'outgoingsArray',
          foreignField: '_id',
          as: 'outgoingsArray',
          pipeline: [
            employeeLookup,
            unwindEmployee
          ],
        },
      },
      {
        $lookup: {
          from: 'incomecollecteds',
          localField: 'incomesArray',
          foreignField: '_id',
          as: 'incomesArray',
          pipeline: [
            branchLookup,
            unwindBranch,
            employeeLookup,
            unwindEmployee,
            {
              $lookup: {
                from: 'employees',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
              }
            },
            { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'employees',
                localField: 'prevOwner',
                foreignField: '_id',
                as: 'prevOwner',
              }
            },
            {
              $unwind: { path: '$prevOwner', preserveNullAndEmptyArrays: true }
            },
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
            },
            { $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'incometypes',
                localField: 'type',
                foreignField: '_id',
                as: 'type',
              },
            },
            {
              $unwind: {
                path: '$type',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'stocks',
          localField: 'initialStockArray',
          foreignField: '_id',
          as: 'initialStockArray',
          pipeline: [
            branchLookup,
            unwindBranch,
            {
              $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product',
              },
            },
            {
              $unwind: {
                path: '$product',
                preserveNullAndEmptyArrays: true,
              },
            },
            employeeLookup,
            unwindEmployee
          ],
        }
      },
      {
        $lookup: {
          from: 'stocks',
          localField: 'midDayStockArray',
          foreignField: '_id',
          as: 'midDayStockArray',
          pipeline: [
            branchLookup,
            unwindBranch,
            {
              $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product',
              },
            },
            {
              $unwind: {
                path: '$product',
                preserveNullAndEmptyArrays: true,
              },
            },
            employeeLookup,
            unwindEmployee
          ],
        }
      },
      {
        $lookup: {
          from: 'stocks',
          localField: 'finalStockArray',
          foreignField: '_id',
          as: 'finalStockArray',
          pipeline: [
            branchLookup,
            unwindBranch,
            {
              $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product',
              },
            },
            {
              $unwind: {
                path: '$product',
                preserveNullAndEmptyArrays: true,
              },
            },
            employeeLookup,
            unwindEmployee
          ],
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch'
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee',
          pipeline: [
            {
              $lookup: {
                from: 'roles',
                localField: 'role',
                foreignField: '_id',
                as: 'role'
              }
            },
            { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } }
          ]
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'assistant',
          foreignField: '_id',
          as: 'assistant',
          pipeline: [
            {
              $lookup: {
                from: 'roles',
                localField: 'role',
                foreignField: '_id',
                as: 'role'
              }
            },
            { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } }
          ]
        }
      },
      {
        $match: {
          $or: [
            { initialStock: { $ne: 0 } },
            { midDayStock: { $ne: 0 } },
            { finalStock: { $ne: 0 } },
            { inputs: { $ne: 0 } },
            { providerInputs: { $ne: 0 } },
            { outputs: { $ne: 0 } },
            { outgoings: { $ne: 0 } },
            { incomes: { $ne: 0 } },
            { balance: { $ne: 0 } }
          ]
        }
      },
      {
        $sort: { 'branch.position': 1 }
      },
      {
        $facet: {
          branchReports: [
            {
              $project: {
                _id: 1,
                createdAt: 1,
                initialStock: 1,
                initialStockArray: 1,
                midDayStock: 1,
                midDayStockArray: 1,
                finalStock: 1,
                finalStockArray: 1,
                inputs: 1,
                inputsArray: 1,
                providerInputs: 1,
                providerInputsArray: 1,
                outputs: 1,
                outputsArray: 1,
                outgoings: 1,
                outgoingsArray: 1,
                incomes: 1,
                incomesArray: 1,
                balance: 1,
                branch: { $first: '$branch' },
                dateSent: 1,
                employee: { $first: '$employee' },
                assistant: { $first: '$assistant' },
                reportData: 1
              }
            }
          ],
          globalTotals: [
            {
              $group: {
                _id: null,   // Agrupar todos los documentos juntos
                totalIncomes: { $sum: { $sum: "$incomesArray.amount" } },  // Sumar incomes
                totalFinalStock: { $sum: { $sum: "$finalStockArray.amount" } },  // Sumar finalStock
                totalOutgoings: { $sum: { $sum: "$outgoingsArray.amount" } },  // Sumar outgoings
                totalBalance: { $sum: { $sum: '$balance' } }
              }
            },
            {
              $project: {
                _id: 0,                 // No mostrar el _id en el resultado
                totalIncomes: 1,        // Mostrar el total de incomes
                totalFinalStock: 1,     // Mostrar el total de finalStock
                totalOutgoings: 1,      // Mostrar el total de outgoings
                totalBalance: 1
              }
            }
          ]
        }
      }
    ]);

    if (branchReportsAggregate.length > 0) {

      const branchReports = branchReportsAggregate?.[0].branchReports ?? []
      const { totalIncomes = 0, totalFinalStock = 0, totalOutgoings = 0, totalBalance = 0 } = branchReportsAggregate?.[0]?.globalTotals?.[0] || {}

      res.status(200).json({ branchReports: branchReports, totalIncomes: totalIncomes, totalStock: totalFinalStock, totalOutgoings: totalOutgoings, totalBalance: totalBalance })

    } else {

      next(errorHandler(400, 'No se encontraron reportes de sucursales para la fecha proporcionada'))
    }

  } catch (error) {

    console.log(error)
    next(error)
  }
}

export const getSupervisorsInfo = async (req, res, next) => {

  const date = dateFromYYYYMMDD(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const supervisorReports = await supervisorsInfoQuery(companyId, topDate, bottomDate)

    if (supervisorReports !== null && supervisorReports !== undefined) {

      const reports = supervisorReports.reports
      const { extraOutgoings = 0, extraOutgoingsArray = 0, deposits = 0, cash = 0, cashArray = 0, depositsArray = 0, verifiedCash = 0, verifiedDeposits = 0, terminalIncomesArray = 0, terminalIncomes = 0, balance = 0 } = supervisorReports?.globalTotals?.[0] || {}

      const netIncomes = cash + deposits + terminalIncomes - extraOutgoings
      const verifiedIncomes = verifiedCash + verifiedDeposits

      res.status(200).json({
        reports,
        extraOutgoings,
        cash,
        deposits,
        terminalIncomes,
        netIncomes,
        missingIncomes: -balance,
        verifiedCash,
        verifiedDeposits,
        verifiedIncomes,
        cashArray,
        depositsArray,
        terminalIncomesArray,
        extraOutgoingsArray
      })

    } else {

      next(errorHandler(404, 'Ningún supervisor ha registrado ingresos o egresos'))
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

export const supervisorsInfoQuery = async (companyId, topDate, bottomDate) => {

  try {

    const supervisorReportsAggregate = await SupervisorReport.aggregate([
      {
        $match: {
          'createdAt': { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          'company': new Types.ObjectId(companyId)
        }
      },
      ...employeeAggregate('supervisor', 'supervisor'),
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
                  ...employeeAggregate('employee'),
                ]
              }
            },
            { $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
            ...employeeAggregate('employee')
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

    const supervisorReports = supervisorReportsAggregate[0]

    if (!supervisorReports) return null

    return supervisorReports

  } catch (error) {

    throw error
  }
}

export const getDaysReportsData = async (req, res, next) => {

  const companyId = req.params.companyId
  const page = req.query.page ? parseInt(req.query.page) : 1

  try {

    const reportsData = await fetchBasicDailyResume(companyId, page)

    if (reportsData.length > 0) {

      res.status(200).json({ data: reportsData, page: page })

    } else {

      next(errorHandler(404, 'Reports data not found'))
    }

  } catch (error) {

    next(error)
  }
}

export const fetchBasicDailyResume = async (companyId, page = 1) => {
  try {
    const limit = 7; // Número de días por página
    const skip = (page - 1) * limit;

    // Agrupar por día y traer los extraOutgoings de ese día con $lookup/$expr
    const resumes = await SupervisorReport.aggregate([
      {
        $match: {
          company: new Types.ObjectId(companyId),
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalIncomes: { $sum: "$incomes" },
          totalExtraOutgoings: { $sum: "$extraOutgoings" },
          totalVerifiedCash: { $sum: "$verifiedCash" },
          totalVerifiedDeposits: { $sum: "$verifiedDeposits" },
          anyCreatedAt: { $first: "$createdAt" },
        },
      },
      {
        $addFields: {
          totalVerifiedIncomes: { $add: ["$totalVerifiedCash", "$totalVerifiedDeposits"] },
        },
      },
      {
        $addFields: {
          totalVerifiedIncomes: { $add: ["$totalVerifiedCash", "$totalVerifiedDeposits"] },
          netIncomes: { $subtract: ["$totalIncomes", "$totalExtraOutgoings"] }
        },
      },
      {
        $addFields: {
          verificationPercentage: {
            $cond: {
              if: { $gt: ["$netIncomes", 0] },
              then: { $multiply: [{ $divide: ["$totalVerifiedIncomes", "$netIncomes"] }, 100] },
              else: 0,
            },
          },
        },
      },
      // Lookup extraOutgoings for each day
      {
        $lookup: {
          from: "extraoutgoings",
          let: {
            day: "$_id.day",
            month: "$_id.month",
            year: "$_id.year",
            companyId: new Types.ObjectId(companyId)
          },
          pipeline: [
            {
              $addFields: {
                createdAtLocal: {
                  $dateSubtract: {
                    startDate: "$createdAt",
                    unit: "hour",
                    amount: 6
                  }
                }
              }
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [{ $dayOfMonth: "$createdAtLocal" }, "$$day"] },
                    { $eq: [{ $month: "$createdAtLocal" }, "$$month"] },
                    { $eq: [{ $year: "$createdAtLocal" }, "$$year"] },
                    { $eq: ["$company", "$$companyId"] }
                  ]
                }
              }
            },
            ...extraOutgoingsAggregate()
          ],
          as: "extraOutgoingsArray"
        }
      },
      {
        $lookup: {
          from: "incomecollecteds",
          let: {
            day: "$_id.day",
            month: "$_id.month",
            year: "$_id.year",
            companyId: new Types.ObjectId(companyId)
          },
          pipeline: [
            {
              $addFields: {
                createdAtLocal: {
                  $dateSubtract: {
                    startDate: "$createdAt",
                    unit: "hour",
                    amount: 6
                  }
                }
              }
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [{ $dayOfMonth: "$createdAtLocal" }, "$$day"] },
                    { $eq: [{ $month: "$createdAtLocal" }, "$$month"] },
                    { $eq: [{ $year: "$createdAtLocal" }, "$$year"] },
                    { $eq: ["$company", "$$companyId"] }
                  ]
                }
              }
            },
            ...incomesAggregate()
          ],
          as: "incomesArray"
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 },
      },
      { $skip: skip },
      { $limit: limit },
      // Project para devolver solo los campos requeridos
      {
        $project: {
          date: "$anyCreatedAt",
          totalIncomes: 1,
          totalExtraOutgoings: 1,
          totalVerifiedCash: 1,
          totalVerifiedDeposits: 1,
          totalVerifiedIncomes: 1,
          verificationPercentage: 1,
          extraOutgoingsArray: 1,
          incomesArray: 1,
        }
      }
    ]);

    return resumes;
  } catch (error) {
    console.error(error);
    throw error;
  }
};