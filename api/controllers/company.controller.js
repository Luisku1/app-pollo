import Company from '../models/company.model.js'
import { errorHandler } from '../utils/error.js'

export const newCompany = async (req, res, next) => {

  const { name, userRef } = req.body
  const newCompany = new Company({ name, owner: userRef })

  try {

    await newCompany.save()
    res.status(201).json('New company created successfully')

  } catch (error) {

    next(error)
  }
}

export const getCompanyById = async (req, res, next) => {

  const companyId = req.params.id

  try {

    const company = Company.findOne({ _id: companyId })

    if (company) {

      res.status(200).json(company)
    }

  } catch (error) {

    next(error)
  }
}

export const getCompanyByOwnerId = async (req, res, next) => {

  const ownerId = req.params.id

  try {

    const company = await Company.findOne({ owner: ownerId })

    if(!company) {

      return next(errorHandler(404, 'Company not found'))
    }

    res.status(200).json(company)

  } catch (error) {

    next(error)
  }
}