import Company from '../models/company.model.js'
import Employee from '../models/employees/employee.model.js'
import { errorHandler } from '../utils/error.js'

export const newCompany = async (req, res, next) => {

  const { name, userRef } = req.body

  try {

    const newCompany = await newCompanyFunction({ name, ownerId: userRef })

    const owner = await Employee.findById(userRef).select('companies defaultCompany').exec()

    if (!owner) {
      return next(errorHandler(404, 'Owner not found'))
    }



    // Add the new company to the owner's companies array
    if (owner.companies.includes(newCompany._id)) {
      return next(errorHandler(400, 'Company already exists for this owner'))
    }

    owner.companies.push(newCompany._id)
    await owner.save()

    res.status(201).json({
      data: newCompany,
      success: true,
      message: 'Company created successfully'
    })

  } catch (error) {

    next(error)
  }
}

export const newCompanyFunction = async ({ name, ownerId }) => {

  try {

    const newCompany = new Company({ name, owner: ownerId })
    await newCompany.save()

    return newCompany
  } catch (error) {
    throw new Error(error.message || 'Error creating company')
  }
}

export const getCompanyById = async (req, res, next) => {

  const companyId = req.params.companyId

  try {

    const company = await Company.findById(companyId).populate({
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