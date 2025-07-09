import ExtraOutgoing from "../models/accounts/outgoings/extra.outgoing.model.js"
import Outgoing from "../models/accounts/outgoings/outgoing.model.js"
import Loan from '../models/accounts/outgoings/loan.model.js'
import { errorHandler } from "../utils/error.js"
import { getDayRange } from "../utils/formatDate.js"
import { Types } from "mongoose"
import Branch from "../models/branch.model.js"
import { pushOrPullBranchReportRecord } from "./branch.report.controller.js"
import { pushOrPullSupervisorReportRecord } from "./employee.controller.js"
import { dateFromYYYYMMDD } from "../../common/dateOps.js"

export const extraOutgoingsAggregate = () => {

  return [
    {
      $lookup: {
        from: 'employeepayments',
        localField: '_id',
        foreignField: 'extraOutgoing',
        as: 'employeePayment',
        pipeline: [
          {
            $lookup: {
              from: 'employees',
              localField: 'employee',
              foreignField: '_id',
              as: 'employee'
            }
          },
          { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } }
        ]
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employee',
        foreignField: '_id',
        as: 'employee',
        pipeline: [
          {
            $project: {
              password: 0,
            }
          }
        ]
      }
    },
    { $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
    {
      $unwind: { path: '$employee', preserveNullAndEmptyArrays: true }
    }
  ]
}

export const newOutgoing = async (req, res, next) => {

  const { _id, amount, concept, company, branch, employee, createdAt } = req.body

  try {

    const outgoing = await newOutgoingAndUpdateBranchReport({ _id, amount, concept, company, branch, employee, createdAt })

    res.status(201).json({ message: 'New outgoing created successfully', outgoing: outgoing })

  } catch (error) {

    next(error)
  }
}

export const newOutgoingAndUpdateBranchReport = async ({ _id, amount, concept, company, branch, employee, createdAt }) => {

  let outgoing = null

  const outgoingData = { amount, concept, company, branch, employee, createdAt }

  if (_id) outgoingData._id = _id


  try {

    const outgoing = await Outgoing.create(outgoingData)

    if (!outgoing) throw new Error("No se logró crear el registro")

    await pushOrPullBranchReportRecord({
      branchId: branch,
      date: createdAt,
      record: outgoing,
      operation: '$addToSet',
      affectsBalancePositively: true,
      amountField: 'outgoings',
      arrayField: 'outgoingsArray'
    })

    return outgoing


  } catch (error) {

    if (outgoing) {

      await Outgoing.findByIdAndDelete(outgoing._id)
    }
    console.log(error)

    throw error;
  }
}

export const getOutgoings = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = dateFromYYYYMMDD(req.params.date)

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

  const { amount, concept, company, employee, createdAt, _id } = req.body
  let extraOutgoing = null

  try {

    extraOutgoing = await newExtraOutgoingFunction({ _id, amount, concept, company, employee, createdAt })


    if (extraOutgoing) {

      res.status(201).json({ message: 'Se creó el nuevo gasto fuera de cuentas', extraOutgoing: extraOutgoing })
    }

  } catch (error) {

    next(error)
  }
}

export const newExtraOutgoingFunction = async ({ _id, amount, concept, company, employee, createdAt, partOfAPayment = false }) => {
  let extraOutgoing = null;

  // Validación de entrada
  if (!amount || !concept || !company || !employee || !createdAt || partOfAPayment === undefined) {
    throw new Error("Faltan datos requeridos para crear el gasto fuera de cuenta");
  }

  const extraOutgoingData = { amount, concept, company, employee, createdAt, partOfAPayment };
  if (_id && Types.ObjectId.isValid(_id)) {
    extraOutgoingData._id = _id;
  }

  try {
    extraOutgoing = await ExtraOutgoing.create(extraOutgoingData);

    await pushOrPullSupervisorReportRecord({
      supervisorId: employee,
      date: extraOutgoing.createdAt,
      record: extraOutgoing,
      operation: '$addToSet',
      affectsBalancePositively: true,
      amountField: 'extraOutgoings',
      arrayField: 'extraOutgoingsArray'
    })

    return extraOutgoing || null;

  } catch (error) {

    if (extraOutgoing) {
      await ExtraOutgoing.findByIdAndDelete(extraOutgoing._id);
    }

    throw error;
  }
};

export const getBranchOutgoingsRequest = async (req, res, next) => {

  const date = dateFromYYYYMMDD(req.params.date)
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

  const date = dateFromYYYYMMDD(req.params.date)
  const companyId = req.params.companyId
  const { bottomDate, topDate } = getDayRange(date)

  try {

    const extraOutgoings = await ExtraOutgoing.aggregate([
      {
        $match: {
          "createdAt": { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          "company": new Types.ObjectId(companyId)
        }
      },
      ...extraOutgoingsAggregate(),
    ]);

    if (extraOutgoings.length == 0) {

      next(errorHandler(404, 'Not found extra outgoings'))

    } else {

      extraOutgoings.sort((extraOutgoing, nextExtraOutgoing) => extraOutgoing.createdAt - nextExtraOutgoing.createdAt)

      let total = 0

      extraOutgoings.forEach((extraOutgoing) => {

        total += extraOutgoing.amount
      })

      res.status(200).json({ extraOutgoings: extraOutgoings, totalExtraOutgoings: total })
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
  let deletedExtraOutgoing = null

  try {

    deletedExtraOutgoing = await deleteExtraOutgoingFunction(extraOutgoingId)

    if (deletedExtraOutgoing) {

      res.status(200).json('Extra outgoing deleted successfully')
    }

  } catch (error) {

    next(error)
  }
}



export const deleteExtraOutgoingFunction = async (extraOutgoingId) => {

  let deletedExtraOutgoing = null

  try {

    deletedExtraOutgoing = await ExtraOutgoing.findByIdAndDelete(extraOutgoingId)

    if (deletedExtraOutgoing) {

      await pushOrPullSupervisorReportRecord({
        supervisorId: deletedExtraOutgoing.employee,
        date: deletedExtraOutgoing.createdAt,
        record: deletedExtraOutgoing,
        operation: '$pull',
        affectsBalancePositively: true,
        amountField: 'extraOutgoings',
        arrayField: 'extraOutgoingsArray'
      })
    }

    return deletedExtraOutgoing || null

  } catch (error) {

    if (deletedExtraOutgoing) {

      await ExtraOutgoing.create(deletedExtraOutgoing)
    }

    console.log(error)

    throw error
  }
}

export const deleteOutgoing = async (req, res, next) => {

  const outgoingId = req.params.outgoingId

  let deletedOutgoing = null

  try {

    deletedOutgoing = await Outgoing.findByIdAndDelete(outgoingId)

    if (!deletedOutgoing) throw new Error("No se eliminó el registro");

    await pushOrPullBranchReportRecord({
      branchId: deletedOutgoing.branch,
      date: deletedOutgoing.createdAt,
      record: deletedOutgoing,
      operation: '$pull',
      affectsBalancePositively: true,
      amountField: 'outgoings',
      arrayField: 'outgoingsArray',

    })

    res.status(200).json('Registro eliminado')

  } catch (error) {

    if (deletedOutgoing) {

      await Outgoing.create({ deletedOutgoing })
    }

    next(error);

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