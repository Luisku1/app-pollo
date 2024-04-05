import ExtraOutgoing from "../models/accounts/outgoings/extra.outgoing.model.js"
import Outgoing from "../models/accounts/outgoings/outgoing.model.js"
import Loan from '../models/accounts/outgoings/loan.model.js'
import { errorHandler } from "../utils/error.js"

export const newOutgoing = async (req, res, next) => {

  const { amount, concept, company, branch, employee } = req.body
  const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(Date.now() - tzoffset)

  try {

    const outgoing = new Outgoing({ amount, concept, company, branch, employee, createdAt: functionalDate })
    await outgoing.save()

    res.status(201).json({ message: 'New outgoing created successfully', outgoing: outgoing })


  } catch (error) {

    next(error)

  }
}

export const newExtraOutgoing = async (req, res, next) => {

  const { extraOutgoingAmount, extraOutgoingConcept, company, employee } = req.body
  const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(Date.now() - tzoffset)

  try {

    const extraOutgoing = new ExtraOutgoing({ amount: extraOutgoingAmount, concept: extraOutgoingConcept, company, employee, createdAt: Date.now() })
    extraOutgoing.save()

    res.status(201).json({ message: 'New extra outgoing created successfully', extraOutgoing: extraOutgoing })

  } catch (error) {
    next(error)
  }
}

export const getBranchOutgoings = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const tzoffset = (new Date(req.params.date)).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(date - tzoffset)
  const functionalDatePlusOneDay = new Date(date - tzoffset)

  functionalDate.setDate(functionalDate.getDate())
  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)


  try {

    const outgoings = await Outgoing.find({

      $and: [{

        createdAt: {

          $gte: functionalDate.toISOString().slice(0, 10)
        }
      },
      {

        createdAt: {

          $lt: functionalDatePlusOneDay.toISOString().slice(0, 10)
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

  const tzoffset = (new Date(req.params.date)).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(date - tzoffset)
  const functionalDatePlusOneDay = new Date(date - tzoffset)

  functionalDate.setDate(functionalDate.getDate())
  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  try {

    const extraOutgoings = await ExtraOutgoing.find({
      $and: [{

        createdAt: {

          $gte: functionalDate.toISOString().slice(0, 10)
        }
      },
      {

        createdAt: {

          $lt: functionalDatePlusOneDay.toISOString().slice(0, 10)
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

    const deleted = await Outgoing.deleteOne({ _id: outgoingId })

    if (!deleted.deletedCount == 0) {

      res.status(200).json('Outgoing deleted successfully')

    } else {

      next(errorHandler(404, 'Outgoing not founded'))
    }


  } catch (error) {

    next(error)
  }
}

export const createLoan = async (req, res, next) => {

  const { amount, company, employee, supervisor } = req.body
  const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(Date.now() - tzoffset)

  try {

    const newLoan = await new Loan({ amount, company, employee, supervisor, createdAt: functionalDate })

    newLoan.save()

    res.status(201).json({ message: 'New loan created successfully', loan: newLoan })

  } catch (error) {

    next(error)
  }

}

export const getLoans = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const tzoffset = (new Date(req.params.date)).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(date - tzoffset)
  const functionalDatePlusOneDay = new Date(date - tzoffset)

  functionalDate.setDate(functionalDate.getDate())
  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)



  try {

    const loans = await Loan.find({

      $and: [{

        createdAt: {

          $gte: functionalDate.toISOString().slice(0, 10)
        }
      },
      {

        createdAt: {

          $lt: functionalDatePlusOneDay.toISOString().slice(0, 10)
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