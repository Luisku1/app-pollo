import Company from '../models/company.model.js'
import Employee from '../models/employees/employee.model.js'
import { errorHandler } from '../utils/error.js'

export const newCompany = async (req, res, next) => {

  const { name, userRef } = req.body
  const newCompany = new Company({ name, owner: userRef })

  try {

    await newCompany.save()
    await Employee.updateOne({_id: userRef}, {$set: {"company": newCompany._id}})
    res.status(201).json(newCompany)

  } catch (error) {

    next(error)
  }
}

export const getCompanyById = async (req, res, next) => {

  const companyId = req.params.companyId

  try {

    const company = await Company.findOne({ _id: companyId }).populate({

      path: 'owner',
      model: 'Employee'
    })

    if (company) {

      res.status(200).json(company)
    }

  } catch (error) {

    next(error)
  }
}

export const getCompanyByOwnerId = async (req, res, next) => {

  const ownerId = req.params.ownerId

  try {

    const company = await Company.findOne({ owner: ownerId }).populate({

      path: 'owner',
      model: 'Employee'

    })

    if(!company) {

      return next(errorHandler(404, 'Company not found'))
    }

    res.status(200).json(company)

  } catch (error) {

    next(error)
  }
}