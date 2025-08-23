import { Types } from 'mongoose'
import Customer from '../models/customers/customer.model.js'
import CustomerReport from '../models/customers/customer.report.model.js'
import { errorHandler } from '../utils/error.js'
import { getDayRange } from '../utils/formatDate.js'
import { branchAggregate } from './branch.controller.js'
import { employeeAggregate, employeePaymentIncomeAggregate } from './employee.controller.js'
import { typeAggregate } from './income.controller.js'
import { productAggregate } from './product.controller.js'
import { dateFromYYYYMMDD } from '../../common/dateOps.js'

export const customerAggregate = (localField = 'customer') => {
  return [
    {
      $lookup: {
        from: 'customers',
        localField: localField,
        foreignField: '_id',
        as: localField
      }
    },
    {
      $unwind: { path: `$${localField}`, preserveNullAndEmptyArrays: true }
    }
  ]
}

export const newCustomer = async (req, res, next) => {

  const { name, lastName, phoneNumber, location, address, company } = req.body

  try {

    const newCustomer = new Customer({ name, lastName, phoneNumber, location, address, company })
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
    customer: customerId,
    createdAt: { $lt: bottomDate }
  })

  const previousBalance = lastCustomerReport?.balance || 0

  return await CustomerReport.create({ customer: customerId, previousBalance, balance: previousBalance, createdAt: bottomDate, company: companyId })
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

      customerReport = await createDefaultCustomerReport({ customerId, date, companyId })
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

  if (!['$addToSet', '$pull'].includes(operation)) throw new Error("Parámetros inválidos, se espera '$addToSet' o '$pull'")
  if (!customerId || !date || !record || !arrayField || !amountField) throw new Error("Parámetros requeridos faltantes en pushOrPullCustomerReportRecord")

  const customerReport = await fetchOrCreateCustomerReport({ customerId, companyId: record.company, date });
  const adjustedBalanceInc = affectsBalancePositively ? record.amount : -record.amount
  const balanceAdjustment = operation === '$addToSet' ? adjustedBalanceInc : -adjustedBalanceInc
  const amountAdjustment = operation === '$addToSet' ? record.amount : -record.amount

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

export const getCustomersReports = async (req, res, next) => {
  const companyId = req.params.companyId
  const date = dateFromYYYYMMDD(req.params.date)

  try {

    const customersReports = await fetchCustomerReports(companyId, date)
    if (!customersReports) throw new Error("No se encontraron reportes de clientes")

    if (customersReports.length < 0) next(errorHandler(404, 'No customers found'))

    res.status(200).json({ customersReports })

  } catch (error) {

    next(error)
  }
}

const fetchCustomerReports = async (companyId, date) => {

  const { bottomDate, topDate } = getDayRange(date);

  try {
    const customerReportsAggregate = await CustomerReport.aggregate([
      {
        $match: {
          company: new Types.ObjectId(companyId),
          createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) }
        },
      },
      {
        $lookup: {
          from: 'inputs',
          localField: 'branchSales',
          foreignField: '_id',
          as: 'branchSales',
          pipeline: [
            ...branchAggregate(),
            ...productAggregate('product'),
            ...employeeAggregate('employee', undefined, companyId),
          ]
        },
      },
      {
        $lookup: {
          from: 'providerinputs',
          localField: 'directSales',
          foreignField: '_id',
          as: 'directSales',
          pipeline: [
            ...branchAggregate(),
            ...productAggregate('product'),
            ...employeeAggregate('employee', undefined, companyId),
          ]
        },
      },
      {
        $lookup: {
          from: 'outputs',
          localField: 'returnsArray',
          foreignField: '_id',
          as: 'returnsArray',
          pipeline: [
            ...branchAggregate(),
            ...productAggregate('product'),
            ...employeeAggregate('employee', undefined, companyId),
          ]
        },
      },
      {
        $lookup: {
          from: 'incomecollecteds',
          localField: 'paymentsArray',
          foreignField: '_id',
          as: 'paymentsArray',
          pipeline: [
            ...branchAggregate(),
            ...employeeAggregate('employee', 'employee', companyId),
            ...employeePaymentIncomeAggregate('_id', companyId),
            ...typeAggregate(),
          ]
        },
      },
      ...customerAggregate('customer'),
      {
        $sort: { 'customer.name': 1 },
      },
      {
        $project: {
          _id: 1,
          balance: 1,
          previousBalance: 1,
          sales: 1,
          branchSales: 1,
          directSales: 1,
          returns: 1,
          returnsArray: 1,
          payments: 1,
          paymentsArray: 1,
          customer: 1,
          company: 1,
          createdAt: 1,
        },
      },
    ]);

    return customerReportsAggregate;

  } catch (error) {
    throw error;
  }
};