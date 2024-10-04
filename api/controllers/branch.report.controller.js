import { Types } from 'mongoose'
import BranchReport from '../models/accounts/branch.report.model.js'
import ReportData from '../models/accounts/report.data.model.js'
import EmployeeDailyBalance from '../models/employees/employee.daily.balance.js'
import { errorHandler } from '../utils/error.js'
import { getDayRange } from '../utils/formatDate.js'
import { getStockValue } from './stock.controller.js'
import { getBranchInputs, getBranchOutputs, getBranchProviderInputs } from './input.output.controller.js'
import { getBranchOutgoings } from './outgoing.controller.js'
import { getBranchIncomes } from './income.controller.js'
import Stock from '../models/accounts/stock.model.js'
import Input from '../models/accounts/input.model.js'
import ProviderInput from '../models/providers/provider.input.model.js'
import Output from '../models/accounts/output.model.js'
import Outgoing from '../models/accounts/outgoings/outgoing.model.js'
import IncomeCollected from '../models/accounts/incomes/income.collected.model.js'

export const createBranchReport = async (req, res, next) => {

  const companyId = req.params.companyId
  const { initialStock, finalStock, inputs, providerInputs, outputs, outgoings, incomes, company, branch, employee, assistant, date } = req.body
  const inputBalance = initialStock + inputs + providerInputs
  const outputBalance = outgoings + outputs + incomes + finalStock
  const balance = outputBalance - inputBalance
  const createdAt = date

  const { bottomDate, topDate } = getDayRange(createdAt)

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

        const newBranchReport = new BranchReport({ initialStock, providerInputs, finalStock, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, balance, createdAt, reportData: reportData._id })

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
        const newBranchReport = new BranchReport({ initialStock, finalStock, providerInputs, inputs, outputs, outgoings, incomes, company, branch, employee, assistant, balance, createdAt, reportData: newReportData._id })

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

export const createDefaultBranchReport = async ({ branchId, date, company, session = null }) => {

  const { bottomDate } = getDayRange(date)

  const newBranchReport = await BranchReport.create([{ branch: branchId, createdAt: bottomDate, company }], { session })

  return newBranchReport
}

export const addRecordToBranchReportArrays = async ({ branchId, company, record, recordType }) => {

  let branchReport = await fetchBranchReport({ branchId, date: record.createdAt })

  if (!branchReport) {

    branchReport = await new BranchReport({ branch: branchId, company })
  }

  switch (recordType) {
    case 'income':
      branchReport.incomesArray.push(record._id);
      break;
    case 'input':
      branchReport.inputsArray.push(record._id);
      break;
    case 'providerInput':
      branchReport.providerInputsArray.push(record._id);
      break;
    case 'output':
      branchReport.outputsArray.push(record._id);
      break;
    case 'outgoing':
      branchReport.outgoingsArray.push(record._id);
      break;
    case 'finalStock':
      branchReport.finalStockArray.push(record._id);
      const date = new Date(record.createdAt)
      date.setDate(date.getDate() + 1)
      const nextDayBranchReport = await fetchBranchReport({ branchId: branchId, date })
      cleanBranchReportReferences(nextDayBranchReport)
      break;
    default:
      throw new Error('Tipo de registro no soportado');
  }

  await branchReport.save()
  await cleanBranchReportReferences(branchReport)
  console.log('Actualizado correctamente')
}

export const removeRecordFromBranchReport = async ({ recordId, recordType }) => {

  let recordDeleted = null;

  switch (recordType) {
    case 'income':
      recordDeleted = await IncomeCollected.findByIdAndDelete(recordId);
      break;
    case 'input':
      recordDeleted = await Input.findByIdAndDelete(recordId);
      break;
    case 'providerInput':
      recordDeleted = await ProviderInput.findByIdAndDelete(recordId);
      break;
    case 'output':
      recordDeleted = await Output.findByIdAndDelete(recordId);
      break;
    case 'outgoing':
      recordDeleted = await Outgoing.findByIdAndDelete(recordId);
      break;
    case 'finalStock':
      recordDeleted = await Stock.findByIdAndDelete(recordId)
      const date = new Date(recordDeleted.createdAt)
      date.setDate(date.getDate() + 1)
      const branchReport = await fetchBranchReport({ branchId: recordDeleted.branch, date })
      if (branchReport) {
        cleanBranchReportReferences(branchReport)
      }
      break;
    default:
      throw new Error('Tipo de registro no válido');
  }

  if (!recordDeleted) {

    throw new Error('No se pudo encontrar o eliminar el registro');
  }

  let branchReport = await fetchBranchReport({ branchId: recordDeleted.branch, date: recordDeleted.createdAt })

  if (!branchReport) {

    throw new Error("No se encontró el reporte");

  }

  switch (recordType) {
    case 'income':
      branchReport.incomesArray = branchReport.incomesArray.filter(id => !id.equals(recordDeleted._id));
      break;
    case 'input':
      branchReport.inputsArray = branchReport.inputsArray.filter(id => !id.equals(recordDeleted._id));
      break;
    case 'providerInput':
      branchReport.providerInputsArray = branchReport.providerInputsArray.filter(id => !id.equals(recordDeleted._id));
      break;
    case 'output':
      branchReport.outputsArray = branchReport.outputsArray.filter(id => !id.equals(recordDeleted._id));
      break;
    case 'outgoing':
      branchReport.outgoingsArray = branchReport.outgoingsArray.filter(id => !id.equals(recordDeleted._id));
      break;
    case 'finalStock':
      branchReport.finalStockArray = branchReport.finalStockArray.filter(id => !id.equals(recordDeleted._id));
      break;
    default:
      throw new Error('Tipo de registro no soportado');
  }

  await cleanBranchReportReferences(branchReport)

  console.log('Eliminado del registro')
}

export const cleanBranchReportReferences = async (branchReport) => {

  if (branchReport) {


    // Verificar y eliminar referencias huérfanas en incomesArray
    const validIncomes = await IncomeCollected.find({ _id: { $in: branchReport.incomesArray } });
    branchReport.incomesArray = validIncomes.map(income => income._id);

    // Hacer lo mismo para otros arrays
    const validInputs = await Input.find({ _id: { $in: branchReport.inputsArray } });
    branchReport.inputsArray = validInputs.map(input => input._id);

    const validProviderInputs = await ProviderInput.find({ _id: { $in: branchReport.providerInputsArray } });
    branchReport.providerInputsArray = validProviderInputs.map(providerInput => providerInput._id);

    const validOutputs = await Output.find({ _id: { $in: branchReport.outputsArray } });
    branchReport.outputsArray = validOutputs.map(output => output._id);

    const validOutgoings = await Outgoing.find({ _id: { $in: branchReport.outgoingsArray } });
    branchReport.outgoingsArray = validOutgoings.map(outgoing => outgoing._id);


    // Guardar los cambios en el BranchReport
    await branchReport.save();
    await recalculateBranchReport({ branchId: branchReport.branch, date: branchReport.createdAt })
  }
};

export const recalculateBranchReport = async ({ branchReport: paramsBranchReport }) => {

  if (paramsBranchReport) {

    const branchReport = await fetchBranchReport({ branchId: paramsBranchReport.branch, date: paramsBranchReport.createdAt, populate: true })

    const incomes = paramsBranchReport.incomesArray?.length > 0
      ? paramsBranchReport.incomesArray.reduce((total, income) => total + income.amount, 0)
      : 0
    paramsBranchReport.incomes = incomes

    const outgoings = paramsBranchReport.outgoingsArray?.length > 0
      ? paramsBranchReport.outgoingsArray.reduce((total, outgoing) => total + outgoing.amount, 0)
      : 0
    paramsBranchReport.outgoings = outgoings

    const inputs = paramsBranchReport.inputsArray?.length > 0
      ? paramsBranchReport.inputsArray.reduce((total, input) => total + input.amount, 0)
      : 0
    paramsBranchReport.inputs = inputs

    const outputs = paramsBranchReport.outputsArray?.length > 0
      ? paramsBranchReport.outputsArray.reduce((total, output) => total + output.amount, 0)
      : 0
    branchReport.outputs = outputs

    const providerInputs = paramsBranchReport.providerInputsArray?.length > 0
      ? paramsBranchReport.providerInputsArray.reduce((total, providerInput) => total + providerInput.amount, 0)
      : 0
    paramsBranchReport.providerInputs = providerInputs

    const finalStock = branchReport.finalStockArray?.length > 0
      ? paramsBranchReport.finalStockArray.reduce((total, finalStock) => total + finalStock.amount, 0)
      : 0
    paramsBranchReport.finalStock = finalStock


    const initialStock = await getStockValue(branchReport.createdAt, paramsBranchReport.branch, 1, paramsBranchReport.createdAt)


    const newBalance = ((paramsBranchReport.outgoings + paramsBranchReport.finalStock + paramsBranchReport.outputs + paramsBranchReport.incomes) - (initialStock + paramsBranchReport.inputs + paramsBranchReport.providerInputs))

    await BranchReport.findByIdAndUpdate(paramsBranchReport._id, { balance: newBalance, initialStock: initialStock, finalStock, providerInputs, outputs, inputs, outgoings, incomes })
  }
}

export const updateBranchReport = async (req, res, next) => {

  const { branchReport, employee, assistant } = req.body

  try {

    const updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {
      $set: { employee: employee, assistant: assistant }
    })

    console.log(updatedBranchReport)

    if (updatedBranchReport) {

      await cleanBranchReportReferences(updatedBranchReport)
      await recalculateBranchReport({ branchReport: updatedBranchReport })

      res.status(200).json('Branch report updated successfully')
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchReport = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date(req.params.date)

  try {

    const branchReport = await fetchBranchReport({ branchId, date })

    if (branchReport) {

      res.status(200).json({ branchReport })

    } else {

      next(errorHandler(404, 'No branch report found'))
    }

  } catch (error) {

    next(error)
  }
}

export const fetchBranchReport = async ({ branchId, date, populate = false, session = null }) => {

  const { bottomDate, topDate } = getDayRange(date)

  try {

    let branchReport = null

    if (populate) {

      branchReport = await BranchReport.findOne({
        $and: [
          {
            createdAt: {

              $lt: new Date(topDate)
            }
          },
          {
            createdAt: {

              $gte: new Date(bottomDate)
            }
          },
          {
            branch: new Types.ObjectId(branchId)
          }
        ]
      })
        .populate('finalStockArray')
        .populate('inputsArray')
        .populate('providerInputsArray')
        .populate('outputsArray')
        .populate('outgoingsArray')
        .populate('incomesArray').session(session)

    } else {

      branchReport = await BranchReport.findOne({
        $and: [
          {
            createdAt: {

              $lt: new Date(topDate)
            }
          },
          {
            createdAt: {

              $gte: new Date(bottomDate)
            }
          },
          {
            branch: new Types.ObjectId(branchId)
          }
        ]
      }).session(session)
    }

    if (branchReport != null && branchReport != undefined) {

      if (Object.getOwnPropertyNames(branchReport).length > 0) {

        return branchReport
      }
    }

  } catch (error) {

    console.log(error)
  }

  return null
}

export const refactorBranchReports = async (req, res, next) => {

  try {

    const branchReports = await BranchReport.find({})

    if (branchReports.length > 0) {

      branchReports.forEach((branchReport, index) => {

        console.log(`${index + 1} de ${branchReports.length}`)

        refactorBranchReport({ branchReport })
      });

      res.status(200).json({ totalBranchReports: branchReports.length, branchReports })
    }

  } catch (error) {

    next(error)
  }
}

export const refactorBranchReport = async ({ branchReport }) => {

  const { bottomDate, topDate } = getDayRange(branchReport.createdAt)

  // const [finalStockArray, inputsArray, providerInputsArray, outputsArray, outgoingsArray, incomesArray] = await Promise.all([

  //   Stock.find({

  //     $and: [{

  //       createdAt: {

  //         $gte: bottomDate
  //       }
  //     },
  //     {
  //       createdAt: {

  //         $lt: topDate

  //       }
  //     },
  //     {
  //       branch: new Types.ObjectId(branchReport.branch)
  //     }]
  //   }).select('_id'),

  //   Input.find({

  //     $and: [{

  //       createdAt: {

  //         $gte: bottomDate
  //       }
  //     },
  //     {

  //       createdAt: {

  //         $lt: topDate
  //       }

  //     },
  //     {
  //       branch: new Types.ObjectId(branchReport.branch)
  //     }]
  //   }).select('_id'),

  //   ProviderInput.find({

  //     $and: [{

  //       createdAt: {

  //         $gte: bottomDate
  //       }
  //     },
  //     {

  //       createdAt: {

  //         $lt: topDate
  //       }

  //     },
  //     {
  //       branch: new Types.ObjectId(branchReport.branch)
  //     }]
  //   }).select('_id'),

  //   Output.find({

  //     $and: [{

  //       createdAt: {

  //         $gte: bottomDate
  //       }
  //     },
  //     {

  //       createdAt: {

  //         $lt: topDate
  //       }

  //     },
  //     {
  //       branch: new Types.ObjectId(branchReport.branch)
  //     }]
  //   }).select('_id'),

  //   Outgoing.find({

  //     $and: [{

  //       createdAt: {

  //         $gte: bottomDate
  //       }
  //     },
  //     {

  //       createdAt: {

  //         $lt: topDate
  //       }

  //     },
  //     {
  //       branch: new Types.ObjectId(branchReport.branch)
  //     }]
  //   }).select('_id'),

  //   IncomeCollected.find({

  //     $and: [{

  //       createdAt: {

  //         $gte: bottomDate
  //       }
  //     },
  //     {

  //       createdAt: {

  //         $lt: topDate
  //       }

  //     },
  //     {
  //       branch: new Types.ObjectId(branchReport.branch)
  //     }]
  //   }).select('_id'),

  // ])

  // const previousBranchReportDate = new Date(branchReport.createdAt)
  // previousBranchReportDate.setDate(previousBranchReportDate.getDate() + 1)

  // let nextBranchReport = await fetchBranchReport({ branchId: branchReport.branch, date: nextBranchReportDate })

  // if (nextBranchReport) {

  //   await BranchReport.findByIdAndUpdate(nextBranchReport._id, {
  //     initialStock,
  //     $inc: { balance: -initialStock }
  //   })
  // }

  // await BranchReport.updateOne({ _id: branchReport._id }, {

  //   finalStockArray: finalStockArray.length > 0 ? finalStockArray : [],
  //   inputsArray: inputsArray.length > 0 ? inputsArray : [],
  //   providerInputsArray: providerInputsArray.length > 0 ? providerInputsArray : [],
  //   outputsArray: outputsArray.length > 0 ? outputsArray : [],
  //   outgoingsArray: outgoingsArray.length > 0 ? outgoingsArray : [],
  //   incomesArray: incomesArray.length > 0 ? incomesArray : []
  // })

  await recalculateBranchReport({ branchReport })

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

