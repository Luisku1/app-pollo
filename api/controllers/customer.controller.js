import Customer from '../models/customers/customer.model.js'

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