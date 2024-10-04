import ExtraOutgoing from "../models/accounts/outgoings/extra.outgoing.model.js"
import Outgoing from "../models/accounts/outgoings/outgoing.model.js"
import Loan from '../models/accounts/outgoings/loan.model.js'
import { errorHandler } from "../utils/error.js"
import { updateReportOutgoings } from "../utils/updateReport.js"
import { getDayRange } from "../utils/formatDate.js"
import { Types } from "mongoose"
import Branch from "../models/branch.model.js"
import { addRecordToBranchReportArrays, createDefaultBranchReport, fetchBranchReport } from "./branch.report.controller.js"
import BranchReport from "../models/accounts/branch.report.model.js"

export const newOutgoing = async (req, res, next) => {

  const { amount, concept, company, branch, employee, createdAt } = req.body

  try {

    const outgoing = await newOutgoingAndUpdateBranchReport({ amount, concept, company, branch, employee, createdAt })


    res.status(201).json({ message: 'New outgoing created successfully', outgoing: outgoing })


  } catch (error) {

    next(error)

  }
}

export const newOutgoingAndUpdateBranchReport = async ({ amount, concept, company, branch, employee, createdAt }) => {

  const session = await mongoose.startSession()

  session.startTransaction()

  try {

    let branchReport = await fetchBranchReport({ branchId: branch, date: createdAt, session })

    if (!branchReport) {

      branchReport = await createDefaultBranchReport({ branchId: branch, date: createdAt, companyId: company, session })
    }

    const outgoing = await Outgoing.create([{ amount, concept, company, branch, employee, createdAt }], { session })

    await BranchReport.findByIdAndUpdate(branchReport._id, {

      $push: { outgoingsArray: outgoing._id },
      $inc: { outgoings: outgoing.amount },
      $inc: { balance: outgoing.amount }

    }, { session })

    session.commitTransaction()
    return outgoing

  } catch (error) {

    session.abortTransaction()
    throw error;

  } finally {

    session.endSession()
  }
}

export const getOutgoings = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date(req.params.date)

  const { bottomDate, topDate } = getDayRange(date)


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

export const newExtraOutgoingQuery = async (req, res, next) => {

  const { extraOutgoingAmount, extraOutgoingConcept, company, employee, createdAt } = req.body

  try {

    const extraOutgoing = await newExtraOutgoingFunction({ amount: extraOutgoingAmount, concept: extraOutgoingConcept, company, employee, createdAt })

    res.status(201).json({ message: 'New extra outgoing created successfully', extraOutgoing: extraOutgoing })

  } catch (error) {
    next(error)
  }
}

export const newExtraOutgoingFunction = async ({ amount, concept, company, employee, createdAt, partOfAPayment = false }) => {

  const extraOutgoing = new ExtraOutgoing({ amount, concept, company, employee, createdAt, partOfAPayment })
  await extraOutgoing.save()

  return extraOutgoing
}

export const getBranchOutgoingsRequest = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  try {

    const outgoings = await getBranchOutgoings({ branchId, date })

    if (outgoings.length == 0) {

      next(errorHandler(404, 'Not found outgoings'))

    } else {

      let total = 0

      outgoings.forEach((outgoing) => {

        total += outgoing.amount
      })

      res.status(200).json({ outgoings: outgoings, outgoingsTotal: total })
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchOutgoings = async ({ branchId, date }) => {

  const { bottomDate, topDate } = getDayRange(date)

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

  return outgoings.length > 0 ? outgoings : []
}

export const getExtraOutgoings = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

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

export const getExtraOutgoingsAvg = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date()

  date.setDate(date.getDate() - 30)

  try {

    const [extraOutgoingsAvg, branchesRentAvg] = await Promise.all([

      ExtraOutgoing.aggregate([

        {
          $match: {
            "company": new Types.ObjectId(companyId),
            "createdAt": { $gte: date }
          }
        },
        {
          $project: {
            extraOutgoingsTotal: { $sum: ["$amount"] }
          }
        },
        {
          $group: {
            _id: null,
            average: { $avg: '$extraOutgoingsTotal' }
          }
        }
      ]),

      Branch.aggregate([
        {
          $match: {
            "company": new Types.ObjectId(companyId),
            "active": true
          }
        },
        {
          $project: {
            rentsTotal: { $sum: ['$rentAmount'] }
          }
        },
        {
          $group: {
            _id: null,
            average: { $avg: '$rentsTotal' }
          }
        }
      ])

    ])

    if (extraOutgoingsAvg.length > 0) {

      res.status(200).json({ extraOutgoingsAvg: extraOutgoingsAvg[0].average - (branchesRentAvg[0].average / 30) })

    } else {

      res.status(200).json({ extraOutgoingsAvg: 0 })
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
  const session = await mongoose.startSession()

  session.startTransaction()

  try {

    const deletedOutgoing = await Outgoing.findByIdAndDelete(outgoingId, { session })

    let branchReport = await fetchBranchReport({ branchId: deletedOutgoing.branch, date: deletedOutgoing.createdAt, session })

    await BranchReport.findByIdAndUpdate(branchReport._id, {

      $pull: { outgoingsArray: deletedOutgoing._id },
      $inc: { outgoings: deletedOutgoing.amount },
      $inc: { outgoings: -deletedOutgoing.amount }

    }, { session })

    session.commitTransaction()
    res.status(200).json('Outgoing deleted successfully')

  } catch (error) {

    session.abortTransaction()
    next(error);

  } finally {

    session.endSession()
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

  const { bottomDate, topDate } = getDayRange(date)

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