import Customer from '../models/customers/customer.model.js'
import CustomerReport from '../models/customers/customer.report.model.js'
import { errorHandler } from '../utils/error.js'
import { getDayRange } from '../utils/formatDate.js'

export const newCustomer = async (req, res, next) => {

  const { name, lastName, phoneNumber, location, company } = req.body

  try {

    const newCustomer = new Customer({ name, lastName, phoneNumber, location, company })
    await newCustomer.save()

    res.status(200).json('New Customer created successfully')

  } catch (error) {

    next(error)
  }
}

export const getCustomers = async (req, res, next) => {

  const companyId = req.params.companyId

  try {

    const customers = await Customer.find({
      active: true,
      company: companyId
    })

    if (customers.length < 0) next(errorHandler(404, 'No customers found'))

    res.status(200).json({ customers })

  } catch (error) {

    next(error)
  }
}

export const updateReportsAndBalancesAccounts = async ({ customerReport, updateInstructions = {}, updatedFields }) => {

  let updatedCustomerReport = null

  try {

    updatedCustomerReport = await CustomerReport.findByIdAndUpdate(customerReport._id, { ...updateInstructions }, { new: true })

    if (!updatedCustomerReport) throw new Error("No se pudo modificar el reporte");

    return updatedCustomerReport

  } catch (error) {

    const hasDifferences = updatedFields.some((field => updatedCustomerReport[field] !== customerReport[field]))

    if (updatedCustomerReport && hasDifferences) {

      await CustomerReport.findByIdAndUpdate(customerReport._id, customerReport)
    }

    throw error
  }
}

export const createDefaultCustomerReport = async ({ customerId, date, companyId }) => {

  const { bottomDate } = getDayRange(date)

  const lastCustomerReport = await CustomerReport.findOne({
    createdAt: { $lt: bottomDate },
    customer: customerId
  })

  const previousBalance = lastCustomerReport.balance || 0

  return await CustomerReport.create({ customer: customerId, previousBalance, createdAt: bottomDate, company: companyId })
}

export const fetchBasicCustomerReport = async ({ customerId, date }) => {

  const { bottomDate, topDate } = getDayRange(date)

  try {

    return await CustomerReport.findOne({
      createdAt: { $gte: bottomDate, $lt: topDate },
      customer: customerId
    })

  } catch (error) {

    throw error
  }
}

export const fetchOrCreateCustomerReport = async ({ customerId, companyId, date }) => {

  let customerReport = null

  try {

    customerReport = await fetchBasicCustomerReport({ customerId, date })

    if (!customerReport) {

      customerReport = createDefaultCustomerReport({ customerId, date, companyId })
    }

    if (!customerReport) throw new Error("No se encontró ni se pudo crear el reporte");

    return customerReport

  } catch (error) {

    throw error
  }
}

export const pushOrPullCustomerReportRecord = async ({
  customerId,
  date,
  record,
  affectsBalancePositively,
  operation,
  arrayField,
  amountField
}) => {

  if (!['$push', '$pull'].includes(operation)) throw new Error("Parámetros inválidos, se espera '$push' o '$pull'")
  if (!customerId || !date || !record || !arrayField || !amountField) throw new Error("Parámetros requeridos faltantes en pushOrPullCustomerReportRecord")

  const customerReport = await fetchOrCreateCustomerReport({ customerId, companyId: record.company, date });
  const adjustedBalanceInc = affectsBalancePositively ? record.amount : -record.amount
  const balanceAdjustment = operation === '$push' ? adjustedBalanceInc : -adjustedBalanceInc
  const amountAdjustment = operation === '$push' ? record.amount : -record.amount

  const updateInstructions = {
    [operation]: { [arrayField]: record._id },
    $inc: { [amountField]: amountAdjustment, balance: balanceAdjustment }
  }

  return updateReportsAndBalancesAccounts({
    customerReport,
    updateInstructions,
    updatedFields: [arrayField, amountField]
  })
}