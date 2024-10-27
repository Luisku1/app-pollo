import { Types } from "mongoose"
import PreOrder from "../models/accounts/pre.order.model"
import { getDayRange } from "../utils/formatDate"

const basicPreOrderAggregateLookups = () => [
  {
    $lookup: {
      from: 'branch',
      localField: 'branch',
      foreignField: '_id',
      as: 'branch'
    }
  },
  {
    $unwind: { path: '$branch', preserveNullAndEmptyArrays: true }
  },
  {
    $lookup: {
      from: 'employees',
      localField: 'seller',
      foreignField: '_id',
      as: 'seller'
    }
  },
  {
    $unwind: { path: '$seller', preserveNullAndEmptyArrays: true }
  },
  {
    $lookup: {
      from: 'employees',
      localField: 'supervisor',
      foreignField: '_id',
      as: 'supervisor'
    }
  },
  {
    $unwind: { path: '$supervisor', preserveNullAndEmptyArrays: true }
  },
  {
    $lookup: {
      from: 'products',
      localField: 'product',
      foreignField: '_id',
      as: 'product'
    }
  },
  {
    $unwind: { path: '$product', preserveNullAndEmptyArrays: true }
  }
]

export const newPreOrder = async (req, res, next) => {

  const { deliverDate, amount, weight, price, advancedMoney, pendingAmount, branchId, productId, companyId, supervisorId, employeeId } = req.body

  try {

    const newPreOrder = PreOrder.create({ deliverDate, amount, weight, price, advancedMoney, pendingAmount, branch: branchId, product: productId, company: companyId, supervisor: supervisorId, employee: employeeId })

    res.status(201).json({ newPreOrder })

  } catch (error) {

    next(error)
  }
}

export const getActivePreOrders = async (req, res, next) => {

  const { companyId } = req.params

  try {

    const activePreOrders = PreOrder.aggregate([
      {
        $match: {
          company: new Types.ObjectId(companyId),
          deliverDate: { $gte: new Date().toISOString() },
          delivered: false
        }
      },
      ...basicPreOrderAggregateLookups
    ])

    res.status(200).json({ activePreOrders })

  } catch (error) {

    next(error)
  }
}

export const getBranchActiveOrders = async (req, res, next) => {

  const { branchId, date } = req.params
  const { bottomDate } = getDayRange(date)

  try {

    const branchActiveOrders = PreOrder.aggregate([
      {
        $match: {
          deliverDate: { $gte: bottomDate },
          branch: new Types.ObjectId(branchId)
        }
      },
      ...basicPreOrderAggregateLookups
    ])

    res.status(200).json({ branchActiveOrders })

  } catch (error) {

    next(error)
  }
}

export const getEmployeeActiveOrders = async (req, res, next) => {

  const { employeeId } = req.params

  try {

    const employeeActiveOrders = PreOrder.aggregate([
      {
        $match: {
          deliverDate: { $gte: new Date().toISOString() },
          delivered: false,
          $or: [
            { employee: new Types.ObjectId(employeeId) },
            { supervisor: new Types.ObjectId(employeeId) }
          ]
        }
      },
      ...basicPreOrderAggregateLookups
    ])

    res.status(200).json({employeeActiveOrders})

  } catch (error) {

    next(error)
  }
}

export const deletePreOrder = async (req, res, next) => {

  const {preOrderId} = req.params

  try {

    const deletedPreOrder = PreOrder.findByIdAndDelete(preOrderId)

    if(!deletedPreOrder) throw new Error("No eliminó el pedido");

    res.status(200).json({deletedPreOrder})

  } catch (error) {

    next(error)
  }
}