import Customer from '../models/customers/customer.model.js'
import { errorHandler } from '../utils/error.js'

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

export const newCustomerSale = async (req, res, next) => {

  const { weight, price, amount, comment, product, company, customer, createdAt } = req.body

}

export const getCustomers = async (req, res, next) => {

  const companyId = req.params.companyId

  try {

    const customers = await Customer.find({
      active: true,
      company: companyId
    })

    if (customers.length > 0) {

      res.status(200).json({ customers })

    } else {

      next(errorHandler(404, 'No customers found'))
    }

  } catch (error) {

    next(error)
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

  if (!['$push', '$pull'].includes(operation)) throw new Error("Invalid . Expected '$push' or '$pull'.")

  const customerReport = await fetchOrCreateBranchReport({ branchId, companyId: record.company, date });

  const adjustedBalance = affectsBalancePositively ? record.amount : -record.amount

  const updatedFields = {
    [operation]: { [arrayField]: record._id },
    $inc: { [amountField]: operation === '$push' ? record.amount : -record.amount, balance: operation === '$push' ? adjustedBalance : -adjustedBalance }
  }

  return updateReportsAndBalancesAccounts({
    branchReport,
    updatedFields
  })
}