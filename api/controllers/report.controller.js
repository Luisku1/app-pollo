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

    const branchReports = await BranchReport.aggregate([
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
          as: 'providerInputsArray'
        }
      },
      {
        $lookup: {
          from: 'incomecollecteds',
          localField: 'incomesArray',
          foreignField: '_id',
          as: 'incomesArray' // Poblamos con documentos completos
        }
      },
      {
        $lookup: {
          from: 'outgoings',
          localField: 'outgoingsArray',
          foreignField: '_id',
          as: 'outgoingsArray' // Poblamos con documentos completos
        }
      },
      {
        $lookup: {
          from: 'stocks',
          localField: 'finalStockArray',
          foreignField: '_id',
          as: 'finalStockArray' // Poblamos con documentos completos
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
          as: 'employee'
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'assistant',
          foreignField: '_id',
          as: 'assistant'
        }
      },
      {
        $sort: { 'branch.position': 1 }
      },
      // {
      //   $project: {
      //     branchReport: '$$ROOT',
      //     totalIncomes: { $sum: '$incomesArray.amount' }, // Sumar ingresos
      //     totalOutgoings: { $sum: '$outgoingsArray.amount' }, // Sumar egresos
      //     totalStocks: { $sum: '$finalStockArray.amount' }, // Sumar stocks
      //     totalBalance: { $sum: '$balance' }
      //   }
      // }

      {
        $facet: {
          branchReports: [
            {
              $project: {
                _id: 1,
                createdAt: 1,
                initialStock: 1,
                initialStockArray: 1,
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

    if (branchReports.length > 0) {

      res.status(200).json({ branchReports: branchReports[0].branchReports, totalIncomes: branchReports[0].globalTotals[0].totalIncomes, totalStock: branchReports[0].globalTotals[0].totalFinalStock, totalOutgoings: branchReports[0].globalTotals[0].totalOutgoings, totalBalance: branchReports[0].globalTotals[0].totalBalance })

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

    const supervisorsInfo = await supervisorsInfoQuery(companyId, topDate, bottomDate)

    const supervisors = supervisorsInfo.supervisors

    if (supervisorsInfo) {

      const extraOutgoings = supervisorsInfo.extraOutgoings
      const verifiedCash = supervisorsInfo.verifiedCash
      const verifiedDeposits = supervisorsInfo.verifiedDeposits
      const grossCash = supervisorsInfo.cash
      const deposits = supervisorsInfo.deposits
      const terminalIncomes = supervisorsInfo.terminalIncomes
      const netIncomes = supervisorsInfo.cash + deposits + terminalIncomes - supervisorsInfo.extraOutgoings
      const missingIncomes = -supervisorsInfo.missingIncomes
      const verifiedIncomes = verifiedCash + verifiedDeposits

      res.status(200).json({ supervisors, extraOutgoings, grossCash, deposits, terminalIncomes, netIncomes, missingIncomes, verifiedCash, verifiedDeposits, verifiedIncomes, cashArray: supervisorsInfo.cashArray, depositsArray: supervisorsInfo.depositsArray, terminalIncomesArray: supervisorsInfo.terminalIncomesArray, extraOutgoingsArray: supervisorsInfo.extraOutgoingsArray })

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

    const rolesId = roles.map((role) => {

      return new Types.ObjectId(role._id)
    })

    const getIncomesByType = (type, arrayName) => ({

      $lookup: {
        from: 'incomecollecteds',
        localField: '_id',
        foreignField: 'employee',
        as: arrayName,
        pipeline: [
          {
            $match: {
              createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) }
            }
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
                {
                  $unwind: {
                    path: '$employee',
                    preserveNullAndEmptyArrays: true
                  }
                }
              ]
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
              as: 'employee'
            }
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customer',
              foreignField: '_id',
              as: 'customer'
            }
          },
          {
            $unwind: {
              path: '$customer',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'incometypes',
              localField: 'type',
              foreignField: '_id',
              as: 'type',
            }
          },
          { $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
          {
            $unwind: {
              path: '$branch',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $unwind: {
              path: '$employee',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $unwind: {
              path: '$type',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $match: { 'type.name': type }
          }
        ]
      }

    })

    const supervisorsInfoAggregate = await Employee.aggregate([

      {
        $match: {

          'role': { $in: rolesId },
          'company': new Types.ObjectId(companyId)
        }
      },
      {
        $lookup: {
          from: 'extraoutgoings',
          localField: '_id',
          foreignField: 'employee',
          as: 'extraOutgoingsArray',
          pipeline: [
            {
              $sort: { "amount": -1 }
            },
            {
              $match: {
                createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) }
              }
            },
            {
              $lookup: {
                from: 'employees',
                localField: 'employee',
                foreignField: '_id',
                as: 'employee'
              }
            },
            {
              $unwind: {
                path: '$employee',
                preserveNullAndEmptyArrays: true
              }
            }
          ]
        }
      },
      getIncomesByType('Depósito', 'depositsArray'),
      getIncomesByType('Efectivo', 'cashArray'),
      getIncomesByType('Terminal', 'terminalIncomesArray'),
      {
        $lookup: {

          from: 'employeedailybalances',
          localField: '_id',
          foreignField: 'employee',
          as: 'dailyBalance',
          pipeline: [
            {
              $match: {
                createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) }
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: '$dailyBalance',
        }
      },
      {
        $lookup: {

          from: 'supervisorreports',
          localField: '_id',
          foreignField: 'supervisor',
          as: 'supervisorReport',
          pipeline: [
            {
              $match: {
                createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) }
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: '$supervisorReport',
        }
      },
      {
        $addFields: {

          extraOutgoings: { $sum: '$extraOutgoingsArray.amount' },
          cash: { $sum: '$cashArray.amount' },
          deposits: { $sum: '$depositsArray.amount' },
          terminalIncomes: { $sum: '$terminalIncomesArray.amount' },
          verifiedCash: '$supervisorReport.verifiedCash',
          verifiedDeposits: '$supervisorReport.verifiedDeposits',
          missingIncomes: '$dailyBalance.supervisorBalance'
        }
      },
      {
        $match: {
          $or: [
            { extraOutgoings: { $gt: 0 } },
            { cash: { $gt: 0 } },
            { terminalIncomes: { $gt: 0 } },
            { deposits: { $gt: 0 } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          supervisors: {
            $push: '$$ROOT'
          },
          extraOutgoings: { $sum: '$extraOutgoings' },
          cash: { $sum: '$cash' },
          deposits: { $sum: '$deposits' },
          verifiedCash: { $sum: '$verifiedCash' },
          verifiedDeposits: { $sum: '$verifiedDeposits' },
          terminalIncomes: { $sum: '$terminalIncomes' },
          missingIncomes: { $sum: '$missingIncomes' }
        }
      }
    ])

    const supervisorsInfo = supervisorsInfoAggregate[0]

    if (!supervisorsInfo) return null

    supervisorsInfo.cashArray = supervisorsInfo.supervisors.flatMap((supervisor) => supervisor.cashArray)
    supervisorsInfo.depositsArray = supervisorsInfo.supervisors.flatMap((supervisor) => supervisor.depositsArray)
    supervisorsInfo.terminalIncomesArray = supervisorsInfo.supervisors.flatMap((supervisor) => supervisor.terminalIncomesArray)
    supervisorsInfo.extraOutgoingsArray = supervisorsInfo.supervisors.flatMap((supervisor) => supervisor.extraOutgoingsArray).sort((a, b) => b.amount - a.amount)

    return supervisorsInfo

  } catch (error) {

    throw error
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