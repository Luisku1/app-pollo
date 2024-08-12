import Company from '../models/company.model.js'
import Employee from '../models/employees/employee.model.js'
import { errorHandler } from '../utils/error.js'

export const newCompany = async (req, res, next) => {

  const { name, userRef } = req.body

  try {

    const newCompany = await newCompanyFunction({ name, ownerId: userRef })
    res.status(201).json(newCompany)

  } catch (error) {

    next(error)
  }
}

export const newCompanyFunction = async ({ name, ownerId }) => {

  const newCompany = new Company({ name, owner: ownerId })
  await newCompany.save()

  return newCompany
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

    if (!company) {

      return next(errorHandler(404, 'Company not found'))
    }

    res.status(200).json(company)

  } catch (error) {

    next(error)
  }
}