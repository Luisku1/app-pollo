import ExtraOutgoing from "../models/accounts/outgoings/extra.outgoing.model.js"
import Outgoing from "../models/accounts/outgoings/outgoing.model.js"
import Loan from '../models/accounts/outgoings/loan.model.js'
import { errorHandler } from "../utils/error.js"
import { updateReportOutgoings } from "../utils/updateReport.js"

export const newOutgoing = async (req, res, next) => {

  const { amount, concept, company, branch, employee, createdAt } = req.body

  try {

    const outgoing = new Outgoing({ amount, concept, company, branch, employee, createdAt})
    await outgoing.save()

    updateReportOutgoings(branch, createdAt, amount)

    res.status(201).json({ message: 'New outgoing created successfully', outgoing: outgoing })


  } catch (error) {

    next(error)

  }
}

export const getOutgoings = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = req.params.date


  const actualLocaleDatePlusOne = new Date(date)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString()

  const bottomDate = new Date(date)
  const topDate = new Date(actualLocalDayPlusOne)

  try {

    const outgoings = await Outgoing.find({

      $and: [
        {
          createdAt: {

            $gte: bottomDate
          }
        },
        {

          createdAt: {

            $lt: topDate
          }

        },
        {
          company: companyId
        }
      ]

    }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'branch', select: 'branch position' })

    if (outgoings.length > 0) {

      res.status(200).json({ outgoings: outgoings })

    } else {

      next(errorHandler(404, 'Not outgoings found'))
    }

  } catch (error) {

    next(error)
  }
}

export const newExtraOutgoing = async (req, res, next) => {

  const { extraOutgoingAmount, extraOutgoingConcept, company, employee, createdAt } = req.body

  try {

    const extraOutgoing = new ExtraOutgoing({ amount: extraOutgoingAmount, concept: extraOutgoingConcept, company, employee, createdAt })
    extraOutgoing.save()

    res.status(201).json({ message: 'New extra outgoing created successfully', extraOutgoing: extraOutgoing })

  } catch (error) {
    next(error)
  }
}

export const getBranchOutgoings = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const actualLocaleDay = date.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')


  try {

    const outgoings = await Outgoing.find({

      $and: [{

        createdAt: {

          $gte: bottomDate
        }
      },
      {

        createdAt: {

          $lt: topDate
        }

      },
      {
        branch: branchId
      }]
    })

    if (outgoings.length == 0) {

      next(errorHandler(404, 'Not found outgoings'))

    } else {

      res.status(200).json({ outgoings: outgoings })
    }

  } catch (error) {

    next(error)
  }
}

export const getExtraOutgoings = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')

  try {

    const extraOutgoings = await ExtraOutgoing.find({
      $and: [{

        createdAt: {

          $gte: bottomDate
        }
      },
      {
        createdAt: {

          $lt: topDate
        }

      },
      {
        company: companyId
      }]
    }).populate({ path: 'employee' })

    if (extraOutgoings.length == 0) {

      next(errorHandler(404, 'Not found extra outgoings'))

    } else {

      res.status(200).json({ extraOutgoings: extraOutgoings })
    }

  } catch (error) {

    next(error)
  }
}

export const deleteExtraOutgoing = async (req, res, next) => {

  const extraOutgoingId = req.params.extraOutgoingId

  try {

    const deleted = await ExtraOutgoing.deleteOne({ _id: extraOutgoingId })

    if (!deleted.deletedCount == 0) {

      res.status(200).json('Extra outgoing deleted successfully')

    } else {

      next(errorHandler(404, 'Extra outgoing not found'))
    }

  } catch (error) {

    next(error)
  }
}

export const deleteOutgoing = async (req, res, next) => {

  const outgoingId = req.params.outgoingId

  try {

    const outgoing = await Outgoing.findById(outgoingId)
    const deleted = await Outgoing.deleteOne({ _id: outgoingId })

    if (!deleted.deletedCount == 0) {

      updateReportOutgoings(outgoing.branch, outgoing.createdAt, -(outgoing.amount))
      res.status(200).json('Outgoing deleted successfully')

    } else {

      next(errorHandler(404, 'Outgoing not founded'))
    }


  } catch (error) {

    next(error)
  }
}

export const createLoan = async (req, res, next) => {

  const { amount, company, employee, supervisor, createdAt } = req.body

  try {

    const newLoan = await new Loan({ amount, company, employee, supervisor, createdAt })

    newLoan.save()

    res.status(201).json({ message: 'New loan created successfully', loan: newLoan })

  } catch (error) {

    next(error)
  }

}

export const getLoans = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')



  try {

    const loans = await Loan.find({

      $and: [{

        createdAt: {

          $gte: bottomDate
        }
      },
      {

        createdAt: {

          $lt: topDate
        }

      },
      {
        company: companyId
      }]
    }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'supervisor', select: 'name lastName' })

    if (loans.length > 0) {

      res.status(200).json({ loans: loans })

    } else {

      next(errorHandler(404, 'Not loans found'))
    }

  } catch (error) {

    next(error)
  }
}

export const deleteLoan = async (req, res, next) => {

  const loanId = req.params.loanId

  try {

    const deleted = await Loan.deleteOne({ _id: loanId })

    if (!deleted.deletedCount == 0) {

      res.status(200).json('Loan deleted successfully')

    } else {

      next(errorHandler(404, 'Loan not founded'))
    }


  } catch (error) {

    next(error)
  }
}