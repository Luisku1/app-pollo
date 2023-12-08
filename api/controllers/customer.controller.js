import Customer from '../models/customers/customer.model.js'

export const newCustomer = (req, res) => {

    const { name, phoneNumber, balance } = req.body
    const newCustomer = new Customer({name, phoneNumber, balance})


}