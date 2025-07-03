import { Types } from 'mongoose'
import BranchReport from '../models/accounts/branch.report.model.js'
import ReportData from '../models/accounts/report.data.model.js'
import EmployeeDailyBalance from '../models/employees/employee.daily.balance.js'
import { errorHandler } from '../utils/error.js'
import { getDayRange } from '../utils/formatDate.js'
import Stock from '../models/accounts/stock.model.js'
import Input from '../models/accounts/input.model.js'
import ProviderInput from '../models/providers/provider.input.model.js'
import Output from '../models/accounts/output.model.js'
import { updateEmployeeDailyBalances } from './employee.controller.js'
import SupervisorReport from '../models/accounts/supervisor.report.model.js'
import { supervisorsInfoQuery } from './report.controller.js'
import { pricesAggregate } from './price.controller.js'
import Branch from '../models/branch.model.js'
import { dateFromYYYYMMDD } from '../../common/dateOps.js'
import { areArraysEqual } from '../../common/arraysOps.js'

export const branchLookup = {
  $lookup: {
    from: 'branches',
    localField: 'branch',
    foreignField: '_id',
    as: 'branch',
  },
};

export const unwindBranch = {
  $unwind: {
    path: '$branch',
    preserveNullAndEmptyArrays: true,
  }
}

export const employeeLookup = {
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
          as: 'role',
        }
      },
      { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          password: 0
        }
      }
    ]
  },
};

export const unwindEmployee = {
  $unwind: {
    path: '$employee',
    preserveNullAndEmptyArrays: true,
  }
}

export const assistantLookup = {
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
          as: 'role',
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
};

export const unwindAssistant = {
  $unwind: {
    path: '$assistant',
    preserveNullAndEmptyArrays: true,
  }
}

export const senderLookup = {
  $lookup: {
    from: 'employees',
    localField: 'sender',
    foreignField: '_id',
    as: 'sender',
    pipeline: [
      {
        $project: {
          password: 0
        }
      }
    ]
  }
};

export const unwindSender = {
  $unwind: {
    path: '$sender',
    preserveNullAndEmptyArrays: true,
  }
}

export const updateReportsAndBalancesAccounts = async ({ branchReport, updateInstructions = {}, updatedFields }) => {

  let updatedBranchReport = null
  let updatedEmployeeDailyBalance = null

  try {

    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, { ...updateInstructions }, { new: true })

    if (!updatedBranchReport) throw new Error("No se pudo modificar el reporte");

    if (updatedBranchReport.employee) {

      updatedEmployeeDailyBalance = await updateEmployeeDailyBalances({ branchReport: updatedBranchReport })

      if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
    }

    return updatedBranchReport

  } catch (error) {

    const hasDifferences = updatedFields.some(field => branchReport[field] !== updatedBranchReport[field])

    if (!updatedEmployeeDailyBalance && updatedBranchReport
      && hasDifferences) {

      await BranchReport.findByIdAndUpdate(branchReport._id, branchReport)
    }

    throw error
  }
}

export const pushOrPullBranchReportRecord = async ({
  branchId,
  date,
  record,
  affectsBalancePositively,
  operation,
  arrayField,
  amountField
}) => {

  if (!['$addToSet', '$pull'].includes(operation)) throw new Error("Parámetros inválidos, se espera '$addToSet' o '$pull'")
  if (!branchId || !date || !record || !arrayField || !amountField) throw new Error("Parámetros requeridos faltantes en pushOrPullBranchReportRecord")

  const branchReport = await fetchOrCreateBranchReport({ branchId, companyId: record.company, date });
  const adjustedBalanceInc = affectsBalancePositively === null ? 0 : affectsBalancePositively ? record.amount : -record.amount
  const balanceAdjustment = operation === '$addToSet' ? adjustedBalanceInc : -adjustedBalanceInc
  const amountAdjustment = operation === '$addToSet' ? record.amount : -record.amount

  const updateInstructions = {
    [operation]: { [arrayField]: record._id },
    $inc: { [amountField]: amountAdjustment, balance: balanceAdjustment }
  }

  return await updateReportsAndBalancesAccounts({
    branchReport,
    updateInstructions,
    updatedFields: [arrayField, amountField]
  })
}

export const fetchOrCreateBranchReport = async ({ branchId, companyId = null, date, pricesDate = null, residualPricesDate = null }) => {

  let branchReport = null

  try {

    branchReport = await fetchBranchReport({ branchId, date, pricesDate, residualPricesDate })

    if (!branchReport) {

      branchReport = await createDefaultBranchReport({ branchId, date, companyId: companyId || await getBranchCompany(branchId), pricesDate, residualPricesDate })
    }

    if (!branchReport) throw new Error("No se encontró ni se pudo crear el reporte");

    return branchReport

  } catch (error) {
    console.log(error)

    throw error
  }
}

export const getBranchCompany = async (branchId) => {

  return (await Branch.findById(branchId)).company
}

export const createDefaultBranchReport = async ({ branchId, date, companyId, pricesDate = null, residualPricesDate = null }) => {

  const { bottomDate } = getDayRange(date)

  const newBranchReport = await BranchReport.create({ branch: branchId, createdAt: bottomDate, company: companyId, pricesDate: pricesDate || bottomDate, residualPricesDate: residualPricesDate || bottomDate })

  return newBranchReport
}

export const recalculateBranchReportRequest = async (req, res, next) => {

  const branchReport = req.body

  let recalculatedBranchReport = null

  try {

    recalculatedBranchReport = await recalculateBranchReport({ branchReport })

    res.status(200).json({
      message: 'Branch report recalculated successfully',
      data: recalculatedBranchReport,
      success: true
    })

  } catch (error) {

    next(error)
  }
}

export const recalculateBranchReport = async ({ branchReport: paramsBranchReport = null }) => {

  let updatedBranchReport = null

  try {

    if (paramsBranchReport) {

      const reportDate = paramsBranchReport.createdAt
      const reportBranchId = paramsBranchReport?.branch?._id ? paramsBranchReport.branch._id : paramsBranchReport.branch

      const { incomesArray, outgoingsArray, inputsArray, outputsArray, providerInputsArray, initialStockArray, finalStockArray, sender, createdAt, branch, employee, assistant, company, pricesDate, dateSent } = await fetchBranchReportInfo({ branchId: reportBranchId, date: reportDate })

      const incomes = incomesArray?.length > 0
        ? incomesArray.reduce((total, income) => total + income.amount, 0)
        : 0
      paramsBranchReport.incomes = incomes

      const outgoings = outgoingsArray?.length > 0
        ? outgoingsArray.reduce((total, outgoing) => total + outgoing.amount, 0)
        : 0
      paramsBranchReport.outgoings = outgoings

      const inputs = inputsArray?.length > 0
        ? inputsArray.reduce((total, input) => total + input.amount, 0)
        : 0
      paramsBranchReport.inputs = inputs

      const outputs = outputsArray?.length > 0
        ? outputsArray.reduce((total, output) => total + output.amount, 0)
        : 0
      paramsBranchReport.outputs = outputs

      const providerInputs = providerInputsArray?.length > 0
        ? providerInputsArray.reduce((total, providerInput) => total + providerInput.amount, 0)
        : 0
      paramsBranchReport.providerInputs = providerInputs

      const initialStock = initialStockArray?.length > 0 ? initialStockArray.reduce((total, initialStock) => total + initialStock.amount, 0) : 0

      paramsBranchReport.initialStock = initialStock

      const finalStock = finalStockArray?.length > 0
        ? finalStockArray.reduce((total, finalStock) => total + finalStock.amount, 0)
        : 0
      paramsBranchReport.finalStock = finalStock

      const newBalance = (outgoings + finalStock + outputs + incomes) - (initialStock + inputs + providerInputs)


      updatedBranchReport = await BranchReport.findByIdAndUpdate(paramsBranchReport._id, { balance: newBalance, initialStock: initialStock, finalStock, providerInputs, outputs, inputs, outgoings, incomes, onZero: false }, { new: true })

      if (updatedBranchReport.employee) {
        await updateEmployeeDailyBalances({ branchReport: updatedBranchReport })
      }

      return {
        balance: newBalance,
        initialStock,
        incomesArray,
        incomes,
        finalStock,
        inputs,
        outputs,
        providerInputs,
        incomes,
        outgoings,
        initialStockArray,
        finalStockArray,
        providerInputsArray,
        outputsArray,
        inputsArray,
        employee,
        assistant,
        sender,
        createdAt,
        branch,
        company,
        pricesDate,
        dateSent,
        _id: paramsBranchReport._id
      }
    }
  } catch (error) {

    if (updatedBranchReport) {

      await BranchReport.findByIdAndUpdate(updatedBranchReport._id, { balance: paramsBranchReport.balance, initialStock: paramsBranchReport.initialStock, finalStock: paramsBranchReport.finalStock, providerInputs: paramsBranchReport.providerInputs, outputs: paramsBranchReport.outputs, inputs: paramsBranchReport.inputs, outgoings: paramsBranchReport.outgoings, incomes: paramsBranchReport.incomes })
    }

    throw error
  }
}

export const setBalanceOnZero = async (req, res, next) => {

  const reportId = req.params.reportId

  try {

    const branchReport = await fetchBranchReportInfo({ reportId })
    await updateReportsAndBalancesAccounts({ branchReport, updateInstructions: { $set: { balance: 0, onZero: true } }, updatedFields: ['balance'] })

    res.status(200).json({
      message: 'Branch report balance set to zero',
      data: { ...branchReport, balance: 0 },
      success: true
    })

  } catch (error) {

    next(error)
  }
}

export const updateBranchReportEmployees = async (req, res, next) => {
  const { reportId } = req.params
  const { employeeId, assistants } = req.body

  if (!reportId) return next(errorHandler(400, 'Report ID is required'))
  if (!employeeId && !assistants) return next(errorHandler(400, 'At least one employee or assistant is required'))

  let branchReport = null
  let reportToUpdate = null
  let previousEmployeeId = null
  let previousAssistants = null

  try {

    branchReport = await fetchBranchReport({ reportId })
    reportToUpdate = { ...branchReport }

    if (!branchReport) throw new Error("No se encontró el reporte, asegúrate de registrar algo antes");
    previousEmployeeId = branchReport.employee?._id || branchReport.employee || null
    previousAssistants = branchReport.assistant || null

    if (previousAssistants && previousAssistants.length > 0 && assistants && assistants.length > 0) {
      if (!areArraysEqual(previousAssistants, assistants)) {
        reportToUpdate.assistant = assistants.map(assistant => assistant._id || assistant)
      }
    }

    if (employeeId && previousEmployeeId && employeeId !== previousEmployeeId) {
      reportToUpdate.employee = employeeId
      reportToUpdate.dateSent = (new Date()).toISOString()
      await updateEmployeeDailyBalances({ branchReport: branchReport, changedEmployee: true })
    }

    await recalculateBranchReport({ branchReport: reportToUpdate })

    res.status(200).json({
      message: 'Branch report employees updated successfully',
      success: true
    })

  } catch (error) {
    next(error)
  }
}

export const getBranchReport = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = dateFromYYYYMMDD(req.params.date)

  try {

    const branchReport = await fetchBranchReportInfo({ branchId, date })

    if (branchReport) {

      res.status(200).json({ branchReport })

    } else {

      next(errorHandler(404, 'No branch report found'))
    }

  } catch (error) {

    next(error)
  }
}

export const changePricesDate = async (branchId, reportDate, pricesDate, residuals) => {

  let branchReport = null
  let updatedBranchReport = null

  try {

    const reportExists = await fetchOrCreateBranchReport({ branchId, date: reportDate })

    if (!reportExists) throw new Error("No se encontró el reporte para la fecha indicada");
    branchReport = await fetchBranchReportInfo({ branchId, date: reportDate })

    const newPricesBranchReport = await updateBranchReportPrices(branchReport, pricesDate, residuals)
    const updateFields = {
      initialStock: newPricesBranchReport.initialStock,
      finalStock: newPricesBranchReport.finalStock,
      inputs: newPricesBranchReport.inputs,
      outputs: newPricesBranchReport.outputs,
      providerInputs: newPricesBranchReport.providerInputs,
      balance: newPricesBranchReport.balance,
    };

    if (residuals) {
      updateFields.residualPricesDate = pricesDate;
    } else {
      updateFields.pricesDate = pricesDate;
    }

    updatedBranchReport = await BranchReport.findByIdAndUpdate(
      newPricesBranchReport._id,
      updateFields,
      { new: true }
    );

    if (!updatedBranchReport) throw new Error("No se pudo actualizar el reporte con las nuevas fechas de precios");

    return newPricesBranchReport

  } catch (error) {

    if (branchReport) {

      await BranchReport.findByIdAndUpdate(branchReport._id, branchReport)
    }
    throw error
  }
}

const updateBranchReportPrices = async (branchReport, pricesDate, residuals = false) => {

  const session = await BranchReport.startSession();
  session.startTransaction();
  let residualPrices = null

  try {
    const prices = await pricesAggregate(branchReport.branch._id, pricesDate);
    const useResidual = Branch.findById(branchReport.branch._id).residualPrices;

    if (residuals && !useResidual) {
      throw new Error("No se pueden usar precios residuales si la sucursal no está configurada para ello");
    }

    if (residuals && useResidual) {
      residualPrices = await pricesAggregate(branchReport.branch._id, branchReport.residualPricesDate, null, true);
    }

    const outputsArray = await Promise.all(
      branchReport.outputsArray.map(async (output) => {
        if (output.specialPrice) return output
        const price = (prices.find((price) => price.productId.toString() === output.product._id.toString())).latestPrice;
        if (price == output.price && (price * output.weigth) === output.amount) return output
        const amount = output.weight * price;
        await Output.findByIdAndUpdate(output._id, { price: price, amount });
        return { ...output, price: price, amount };
      })
    );

    const outputs = outputsArray.reduce((acc, output) => acc + output.amount, 0);

    const inputsArray = await Promise.all(
      branchReport.inputsArray.map(async (input) => {
        if (input.specialPrice) return input
        const price = (prices.find((price) => price.productId.toString() === input.product._id.toString())).latestPrice;
        if (price == input.price && (price * input.weigth) === input.amount) return input
        const amount = input.weight * price;
        await Input.findByIdAndUpdate(input._id, { price: price, amount });
        return { ...input, price: price, amount };
      })
    );

    const inputs = inputsArray.reduce((acc, input) => acc + input.amount, 0);

    const providerInputsArray = await Promise.all(
      branchReport.providerInputsArray.map(async (providerInput) => {
        if (providerInput.specialPrice) return providerInput
        const price = (prices.find((price) => price.productId.toString() === providerInput.product._id.toString())).latestPrice;
        if (price == providerInput.price && (price * providerInput.weigth) === providerInput.amount) return providerInput
        const amount = providerInput.weight * price;
        await ProviderInput.findByIdAndUpdate(providerInput._id, { price: price, amount });
        return { ...providerInput, price: price, amount };
      })
    );

    const providerInputs = providerInputsArray.reduce((acc, providerInput) => acc + providerInput.amount, 0);

    const finalStockArray = await Promise.all(
      branchReport.finalStockArray.map(async (finalStock) => {
        const price = (prices.find((price) => price.productId.toString() === finalStock.product._id.toString())).latestPrice;
        if (price == finalStock.price && (price * finalStock.weigth) === finalStock.amount) return finalStock
        const amount = finalStock.weight * price;
        await Stock.findByIdAndUpdate(finalStock._id, { price: price, amount });
        return { ...finalStock, price: price, amount };
      })
    );

    const finalStock = finalStockArray.reduce((acc, finalStock) => acc + finalStock.amount, 0);

    const initialStockArray = await Promise.all(
      branchReport.initialStockArray.map(async (initialStock) => {
        let price = null;
        if (residualPrices) {
          price = (residualPrices.find((price) => price.productId.toString() === initialStock.product._id.toString())).latestPrice;
        } else {
          price = (prices.find((price) => price.productId.toString() === initialStock.product._id.toString())).latestPrice;
        }
        if (price == initialStock.price && (price * initialStock.weigth) === initialStock.amount) return initialStock
        const amount = initialStock.weight * price;
        await Stock.findByIdAndUpdate(initialStock._id, { price: price, amount });
        return { ...initialStock, price: price, amount };
      })
    );

    const initialStock = initialStockArray.reduce((acc, initialStock) => acc + initialStock.amount, 0);


    const incomes = branchReport.incomesArray.reduce((acc, income) => acc + income.amount, 0);
    const balance = (outputs + finalStock + incomes + branchReport.outgoings) - (initialStock + inputs + providerInputs);

    await session.commitTransaction();
    session.endSession();

    return {
      ...branchReport,
      balance,
      outputsArray,
      inputsArray,
      providerInputsArray,
      initialStockArray,
      finalStockArray,
      outputs,
      inputs,
      providerInputs,
      initialStock,
      finalStock
    };

  } catch (error) {

    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

const fetchBranchReportInfo = async ({ branchId = null, date = null, reportId = null }) => {

  const { bottomDate, topDate } = date ? getDayRange(date) : { bottomDate: null, topDate: null }

  const match = reportId ? { _id: new Types.ObjectId(reportId) } : { branch: new Types.ObjectId(branchId), createdAt: { $lt: new Date(topDate), $gte: new Date(bottomDate) } };

  try {
    const branchReport = await BranchReport.aggregate([
      {
        $match: match,
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
        },
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
                        { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
                        {
                          $project: {
                            password: 0
                          }
                        }
                      ]
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
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch',
        },
      },
      {
        $unwind: {
          path: '$branch',
          preserveNullAndEmptyArrays: true,
        },
      },
      employeeLookup,
      unwindEmployee,
      assistantLookup,
      unwindAssistant,
      senderLookup,
      unwindSender,
      {
        $project: {
          company: 1,
          pricesDate: 1,
          dateSent: 1,
          balance: 1,
          employee: 1,
          assistant: 1,
          sender: 1,
          initialStockArray: 1,
          initialStock: 1,
          midDayStock: 1,
          midDayStockArray: 1,
          finalStockArray: 1,
          finalStock: 1,
          inputsArray: 1,
          inputs: 1,
          providerInputsArray: 1,
          providerInputs: 1,
          outputsArray: 1,
          outputs: 1,
          outgoingsArray: 1,
          outgoings: 1,
          incomesArray: 1,
          incomes: 1,
          createdAt: 1,
          branch: 1,
        },
      },
    ]);

    return branchReport.length > 0 ? branchReport[0] : createDefaultBranchReport({ branchId, date, companyId: await getBranchCompany(branchId) });

  } catch (error) {
    throw error;
  }
};

export const fetchBranchReport = async ({ branchId, date, populate = false, pricesDate = null, residualPricesDate = null }) => {

  const { bottomDate, topDate } = getDayRange(new Date(date))

  try {

    let branchReport = null

    if (populate) {

      branchReport = await fetchBranchReportInfo({ branchId, date })
    } else {

      branchReport = await BranchReport.findOne({
        createdAt: { $lt: topDate, $gte: bottomDate },
        branch: new Types.ObjectId(branchId)
      })
    }

    if (branchReport && pricesDate) {
      branchReport = { ...branchReport, pricesDate }
      await BranchReport.findByIdAndUpdate(branchReport._id, { pricesDate })
    }

    if (branchReport && residualPricesDate) {
      branchReport = { ...branchReport, residualPricesDate }
      await BranchReport.findByIdAndUpdate(branchReport._id, { residualPricesDate })
    }

    return branchReport || null

  } catch (error) {

    console.log(error)
    throw error
  }
}

export const fetchBranchReportById = async ({ branchReportId, populate = false }) => {

  try {

    let branchReport = null

    if (populate) {

      branchReport = await BranchReport.findById(branchReportId)
        .populate('finalStockArray')
        .populate('inputsArray')
        .populate('providerInputsArray')
        .populate('outputsArray')
        .populate('outgoingsArray')
        .populate('incomesArray')

    } else {

      branchReport = await BranchReport.findById(branchReportId)
    }

    return branchReport || null

  } catch (error) {

    console.log(error)
  }
}

export const refactorBranchReports = async (req, res, next) => {

  try {

    const branchReports = await BranchReport.find({})

    if (branchReports.length > 0) {

      branchReports.forEach((branchReport, index) => {

        refactorBranchReport({ branchReport })
      });

      res.status(200).json({ totalBranchReports: branchReports.length, branchReports })
    }

  } catch (error) {

    next(error)
  }
}

export const refactorSupervisorReports = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date()

  date.setDate(date.getDate() - 1)

  try {

    while (date <= new Date()) {

      const { bottomDate, topDate } = getDayRange(date)

      const supervisorsInfo = await supervisorsInfoQuery(companyId, topDate, bottomDate)

      supervisorsInfo.supervisors.forEach(async (supervisor) => {

        if (supervisor) {

          let supervisorReport = await SupervisorReport.findOne({
            createdAt: { $lt: topDate, $gte: bottomDate },
            supervisor: new Types.ObjectId(supervisor.supervisor._id)
          })

          if (!supervisorReport) {

            supervisorReport = await SupervisorReport.create({ company: companyId, supervisor: supervisor.supervisor._id, createdAt: bottomDate })
          }

          if (supervisorReport) {

            const updatedSupervisorReport = await SupervisorReport.findByIdAndUpdate(supervisorReport._id, {

              extraOutgoings: supervisor.supervisor.totalExtraOutgoings,
              incomes: supervisor.supervisor.totalCash + supervisor.supervisor.totalDeposits,
              verifiedCash: supervisor.supervisor.totalCash + supervisor.supervisor.totalDeposits - supervisor.supervisor.totalExtraOutgoings,
              balance: supervisor.supervisor.totalCash + supervisor.supervisor.totalDeposits - supervisor.supervisor.totalExtraOutgoings - (supervisor.supervisor.totalCash + supervisor.supervisor.totalDeposits - supervisor.supervisor.totalExtraOutgoings)
            }, { new: true })

            const dailyBalance = await EmployeeDailyBalance.findOne({
              createdAt: { $lt: topDate, $gte: bottomDate },
              employee: new Types.ObjectId(supervisor.supervisor._id)
            })

            if (!dailyBalance) throw new Error("No se encontró el balance del empleado.");

            const updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, {
              supervisorBalance: updatedSupervisorReport.balance
            }, { new: true })

            if (!updatedDailyBalance) throw new Error("No se editó el balance del supervisor");
          }
        }
      })

      date.setDate(date.getDate() + 1)
    }

    res.status(200).json('Se terminó la refactorización')

  } catch (error) {

    next(error)
  }
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

