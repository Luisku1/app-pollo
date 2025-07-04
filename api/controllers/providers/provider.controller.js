import Provider from "../../models/providers/provider.model.js"
import ProviderPayment from "../../models/providers/provider.payment.model.js"
import ProviderPurchase from "../../models/providers/provider.purchase.model.js"
import ProviderReport from "../../models/providers/provider.report.model.js"
import ProviderReturns from "../../models/providers/provider.returns.model.js"

export const newProvider = async (req, res, next) => {

  const { name, phoneNumber, location, company } = req.body

  try {

    const newProvider = Provider({ name, phoneNumber, location, company })
    await newProvider.save()

    res.status(200).json('New provider created successfully')

  } catch (error) {

    next(error)
  }
}

export const getProviders = async (req, res, next) => {

  const companyId = req.params.companyId

  try {

    const providers = await Provider.find({
      active: true,
      company: companyId
    })

    if (providers.length < 0) next(errorHandler(404, 'No providers found'))

    res.status(200).json({ providers })

  } catch (error) {

    next(error)
  }
}

export const updateReportsAndBalancesAccounts = async ({ providerReport, updateInstructions = {}, updatedFields }) => {

  let updatedProviderReport = null

  try {

    updatedProviderReport = await ProviderReport.findByIdAndUpdate(providerReport._id, { ...updateInstructions }, { new: true })

    if (!updatedProviderReport) throw new Error("No se pudo modificar el reporte");

    return updatedProviderReport

  } catch (error) {

    const hasDifferences = updatedFields.some((field => updatedProviderReport[field] !== providerReport[field]))

    if (updatedProviderReport && hasDifferences) {

      await ProviderReport.findByIdAndUpdate(providerReport._id, providerReport)
    }

    throw error
  }
}

export const createDefaultProviderReport = async ({ providerId, date, companyId }) => {

  const { bottomDate } = getDayRange(date)

  const lastProviderReport = await ProviderReport.findOne({
    createdAt: { $lt: bottomDate },
    provider: providerId
  })

  const previousBalance = lastProviderReport.balance || 0

  return await ProviderReport.create({ provider: providerId, previousBalance, createdAt: bottomDate, company: companyId })
}

export const fetchBasicProviderReport = async ({ providerId, date }) => {

  const { bottomDate, topDate } = getDayRange(date)

  try {

    return await ProviderReport.findOne({
      createdAt: { $gte: bottomDate, $lt: topDate },
      provider: providerId
    })

  } catch (error) {

    throw error
  }
}

export const fetchOrCreateProviderReport = async ({ providerId, companyId, date }) => {

  let providerReport = null

  try {

    providerReport = await fetchBasicProviderReport({ providerId, date })

    if (!providerReport) {

      providerReport = await createDefaultProviderReport({ providerId, date, companyId })
    }

    if (!providerReport) throw new Error("No se encontró ni se pudo crear el reporte");

    return providerReport

  } catch (error) {

    throw error
  }
}

export const pushOrPullProviderReportRecord = async ({
  providerId,
  date,
  record,
  affectsBalancePositively,
  operation,
  arrayField,
  amountField
}) => {

  if (!['$addToSet', '$pull'].includes(operation)) throw new Error("Parámetros inválidos, se espera '$addToSet' o '$pull'")
  if (!providerId || !date || !record || !arrayField || !amountField) throw new Error("Parámetros requeridos faltantes en pushOrPullProviderReportRecord")

  const providerReport = await fetchOrCreateProviderReport({ providerId, companyId: record.company, date });
  const adjustedBalanceInc = affectsBalancePositively ? record.amount : -record.amount
  const balanceAdjustment = operation === '$addToSet' ? adjustedBalanceInc : -adjustedBalanceInc
  const amountAdjustment = operation === '$addToSet' ? record.amount : -record.amount

  const updateInstructions = {
    [operation]: { [arrayField]: record._id },
    $inc: { [amountField]: amountAdjustment, balance: balanceAdjustment }
  }

  return updateReportsAndBalancesAccounts({
    providerReport,
    updateInstructions,
    updatedFields: [arrayField, amountField]
  })
}

export const newPurchase = async (req, res, next) => {

  const { weight, price, amount, pieces, comment, isReturn, specialPrice, product, company, supervisor, provider } = req.body
  let purchase = null

  try {

    purchase = await ProviderPurchase.create({ weight, price, isReturn, amount: isReturn ? -amount : amount, pieces, comment, specialPrice, product, company, supervisor, provider })

    await pushOrPullProviderReportRecord({
      providerId: purchase.provider,
      date: purchase.createdAt,
      record: purchase,
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'purchasesArray',
      amountField: 'purchases'
    })

    res.status(201).json({
      data: purchase,
      message: 'Compra registrada correctamente',
      success: true
    })

  } catch (error) {

    next(error)
  }
}

export const deletePurchase = async (req, res, next) => {

  const purchaseId = req.params.purchaseId
  let deletedPurchase = null

  try {

    deletedPurchase = await ProviderPurchase.findByIdAndDelete(purchaseId)

    if (!deletedPurchase) throw new Error("No se eliminó el la compra");

    await pushOrPullProviderReportRecord({
      providerId: deletedPurchase.provider,
      date: deletedPurchase.createdAt,
      record: deletedPurchase,
      affectsBalancePositively: false,
      operation: '$pull',
      arrayField: 'purchasesArray',
      amountField: 'purchases'
    })

    res.status(200).json({
      message: 'Compra eliminada correctamente',
      deletedPurchase
    })

  } catch (error) {

    next(error)
  }
}

export const newReturn = async (req, res, next) => {

  const { weight, price, amount, pieces, comment, specialPrice, product, company, supervisor, provider } = req.body

  let createdReturn = null

  try {

    createdReturn = await ProviderReturns.create({
      amount,
      price,
      weight,
      pieces,
      comment,
      specialPrice,
      company,
      product,
      supervisor,
      provider
    })

    if (!createdReturn) throw new Error("No se creó la devolución");

    await pushOrPullProviderReportRecord({
      providerId: createdReturn.provider,
      date: createdReturn.createdAt,
      record: createdReturn,
      affectsBalancePositively: true,
      operation: '$addToSet',
      arrayField: 'returnsArray',
      amountField: 'returns'
    })

    res.status(201).json({

      message: 'Se registró la devolución',
      return: createdReturn
    })

  } catch (error) {

    next(error)
  }
}

export const deleteReturn = async (req, res, next) => {

  const returnId = req.params.returnId
  let deletedReturn = null

  try {

    deletedReturn = await ProviderReturns.findByIdAndDelete(returnId)

    if (!deletedReturn) throw new Error("No se eliminó la devolución");

    await pushOrPullProviderReportRecord({
      providerId: deletedReturn.provider,
      date: deletedReturn.createdAt,
      record: deletedReturn,
      affectsBalancePositively: true,
      operation: '$pull',
      arrayField: 'returnsArray',
      amountField: 'returns'
    })

    res.status(200).json({
      message: 'Devolución eliminada',
      return: deletedRetur
    })

  } catch (error) {

    next(error)
  }
}

export const newPayment = async (req, res, next) => {

  const { amount, provider, company } = req.body
  let payment = null

  try {

    payment = await ProviderPayment.create({ amount, company, provider })

    if (!payment) throw new Error("No se creó el pago a proveedor");

    await pushOrPullProviderReportRecord({
      providerId: payment.provider,
      date: payment.createdAt,
      record: payment,
      affectsBalancePositively: true,
      operation: '$addToSet',
      arrayField: 'paymentsArray',
      amountField: 'payments'
    })

    res.status(200).json({
      message: 'Se creó el pago a proveedor',
      payment
    })

  } catch (error) {

    if (payment) {

      await ProviderPayment.findByIdAndDelete(payment._id)
    }

    next(error)
  }
}

export const deletePayment = async (req, res, next) => {

  const paymentId = req.params.paymentId
  let deletedPayment = null

  try {

    deletedPayment = await ProviderPayment.findByIdAndDelete(paymentId)

    if (!deletedPayment) throw new Error("No se eliminó el pago a proveedor");

    await pushOrPullProviderReportRecord({
      providerId: deletedPayment.provider,
      date: deletedPayment.createdAt,
      record: deletedPayment,
      affectsBalancePositively: true,
      operation: '$pull',
      arrayField: 'paymentsArray',
      amountField: 'payments'
    })

    res.status(200).json({
      message: 'Se eliminó el pago a empleado',
      payment: deletedPayment
    })

  } catch (error) {

    if (deletedPayment) {

      await ProviderPayment.create(deletedPayment)
    }

    next(error)
  }
}