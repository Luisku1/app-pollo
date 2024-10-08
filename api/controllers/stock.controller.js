import mongoose from "mongoose";
import BranchReport from "../models/accounts/branch.report.model.js";
import Price from "../models/accounts/price.model.js";
import Stock from "../models/accounts/stock.model.js";
import Branch from "../models/branch.model.js";
import { errorHandler } from "../utils/error.js";
import { getDayRange } from "../utils/formatDate.js";
import { updateReportStock } from "../utils/updateReport.js";
import { createDefaultBranchReport, fetchBranchReport, removeRecordFromBranchReport } from "./branch.report.controller.js";
import { pricesAggregate } from "./price.controller.js";
import { updateEmployeeDailyBalancesBalance } from "./employee.controller.js";

export const createStock = async (req, res, next) => {

  const { pieces, weight, price, amount, branch, product, company, employee, createdAt } = req.body

  try {

    const newStock = await createStockAndUpdateBranchReport({ pieces, price, employee, weight, amount, branch, product, company, createdAt })

    res.status(201).json({ message: 'New stock created successfully', stock: newStock })

  } catch (error) {

    next(error)

  }
}

export const createStockAndUpdateBranchReport = async ({ pieces, price, employee, weight, amount, branch, product, company, createdAt }) => {

  const session = await mongoose.startSession()

  session.startTransaction()

  try {

    let branchReport = await fetchBranchReport({ branchId: branch, date: createdAt, session })

    if (!branchReport) {

      branchReport = await createDefaultBranchReport({ branchId: branch, date: createdAt, companyId: company, session })
    }

    const stock = await Stock.create([{ pieces, price, employee, weight, amount, branch, product, company, createdAt }], { session })

    await BranchReport.findByIdAndUpdate(branchReport._id, {

      $push: { finalStockArray: stock[0]._id },
      $inc: {
        finalStock: stock[0].amount,
        balance: stock[0].amount
      }

    }, { session })

    if (branchReport.employee) {

      await updateEmployeeDailyBalancesBalance({ branchReport: branchReport, session })
    }

    const nextBranchReportDate = new Date(createdAt)
    nextBranchReportDate.setDate(nextBranchReportDate.getDate() + 1)

    branchReport = await fetchBranchReport({ branchId: branch, date: nextBranchReportDate, session })

    if (!branchReport) {

      branchReport = await createDefaultBranchReport({ branchId: branch, date: nextBranchReportDate, companyId: company, session })
    }

    await BranchReport.findByIdAndUpdate(branchReport._id, {

      $push: { initialStockArray: stock[0]._id },
      $inc: {
        initialStock: stock[0].amount,
        balance: -stock[0].amount
      }

    }, { session })

    if (branchReport.employee) {

      await updateEmployeeDailyBalancesBalance({ branchReport: branchReport, session })
    }

    await session.commitTransaction()
    return stock[0]

  } catch (error) {

    await session.abortTransaction()
    throw error;

  } finally {

    session.endSession()
  }
}

export const getInitialStock = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId
  const reportExists = req.params.reportExists
  const reportDate = req.params.reportDate

  try {

    const initialStock = await getStockValue(date, branchId, reportExists, reportDate)

    if (initialStock) {

      res.status(200).json({ initialStock: initialStock })

    } else {

      errorHandler(404, 'Error Ocurred')
    }

  } catch (error) {

    next(error)
  }
}

export const getStockValue = async (date, branchId, reportExists, reportDate) => {

  let pricesDate
  const dateMinusOne = new Date(date)
  dateMinusOne.setDate(dateMinusOne.getDate() - 1)

  const { bottomDate, topDate } = getDayRange(dateMinusOne)

  if (reportExists == 1) {

    pricesDate = new Date(reportDate)

  } else {

    const { topDate } = getDayRange(date)
    pricesDate = topDate
  }

  const initialStock = await Stock.find({

    createdAt: { $lt: topDate, $gte: bottomDate },
    branch: branchId
  })

  if (initialStock) {

    const branchPrices = await pricesAggregate(branchId, pricesDate)

    let total = 0.0

    if (branchPrices.error == null) {

      initialStock.forEach((stock) => {

        const priceIndex = branchPrices.data.prices.findIndex((price) => (price.productId.toString() == stock.product.toString()))

        total += parseFloat(branchPrices.data.prices[priceIndex].latestPrice * stock.weight)

      })

      return total

    }
  } else {

    return 0.0
  }
}

export const getBranchDayStock = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  try {

    const stockItems = await getBranchStock({ branchId, date })

    if (stockItems.length == 0) {

      next(errorHandler(404, 'Not found stock items'))

    } else {

      let totalStock = 0

      stockItems.map((stock) => {

        totalStock += stock.amount
      })

      res.status(200).json({ stock: stockItems, totalStock: totalStock })
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchStock = async ({ branchId, date }) => {

  const { bottomDate, topDate } = getDayRange(date)

  const stock = await Stock.find({

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
  }).populate({ path: 'product', select: 'name' })

  return stock.length > 0 ? stock : []

}

export const getCompanyDayStock = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date(req.params.date)

  const { bottomDate, topDate } = getDayRange(date)


  try {

    const stockItems = await Stock.find({

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
    })

    if (stockItems.length == 0) {

      next(errorHandler(404, 'Not found stock items'))

    } else {

      res.status(200).json({ stock: stockItems })
    }

  } catch (error) {

    next(error)
  }

}

export const deleteStock = async (req, res, next) => {

  const stockId = req.params.stockId
  const session = await mongoose.startSession()

  session.startTransaction()

  try {

    const deletedStock = await Stock.findByIdAndDelete(stockId, { session })

    let branchReport = await fetchBranchReport({ branchId: deletedStock.branch, date: deletedStock.createdAt, session })

    await BranchReport.findByIdAndUpdate(branchReport._id, {

      $pull: { finalStockArray: deletedStock._id },
      $inc: {
        finalStock: -deletedStock.amount,
        balance: -deletedStock.amount
      }

    }, { session })

    if (branchReport.employee) {

      await updateEmployeeDailyBalancesBalance({ branchReport: branchReport, session })
    }

    const nextBranchReportDate = new Date(deletedStock.createdAt)
    nextBranchReportDate.setDate(nextBranchReportDate.getDate() + 1)

    branchReport = await fetchBranchReport({ branchId: deletedStock.branch, date: nextBranchReportDate, session })

    if (!branchReport) {

      branchReport = await createDefaultBranchReport({ branchId: deletedStock.branch, date: nextBranchReportDate, companyId: company, session })
    }

    await BranchReport.findByIdAndUpdate(branchReport._id, {

      $pull: { initialStockArray: deletedStock._id },
      $inc: {
        initialStock: -deletedStock.amount,
        balance: deletedStock.amount
      },

    }, { session })

    if (branchReport.employee) {

      await updateEmployeeDailyBalancesBalance({ branchReport: branchReport, session })
    }

    await session.commitTransaction()
    res.status(200).json({ message: 'Stock deleted correctly' })

  } catch (error) {

    await session.abortTransaction()
    next(error);

  } finally {

    session.endSession()
  }
}

export const getTotalStockByProduct = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date(req.params.date)

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const stock = await Stock.find({
      $and: [
        {
          createdAt: {

            $lt: topDate
          }
        },
        {
          createdAt: {

            $gte: bottomDate
          }
        },
        {
          company: companyId
        }
      ]
    }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'product', select: 'name createdAt' })

    if (stock.length > 0) {

      stock.sort((prevStock, nextStock) => prevStock.product.createdAt - nextStock.product.createdAt)

      const groupedStock = groupStockByProductFunction(stock)

      Object.values(groupedStock).forEach((stockProduct) => {

        // stockProduct.branches.sort((a, b) => a.branch.position - b.branch.position)
        stockProduct.branches.sort((a, b) => b.weight - a.weight)
      })

      res.status(200).json({ stock: groupedStock })

    } else {

      next(errorHandler(404, 'Stock not found'))
    }

  } catch (error) {

    next(error)
  }
}

const groupStockByProductFunction = (stock) => {

  const result = {}

  stock.forEach(stock => {


    if (!result[stock.product._id]) {

      result[stock.product._id] = {

        product: stock.product,
        total: 0.0,
        branches: []
      }
    }


    const index = result[stock.product._id].branches.findIndex((branch) => stock.branch._id == branch.branch._id)

    if (index != -1) {

      result[stock.product._id].total = stock.weight + result[stock.product._id].total
      result[stock.product._id].branches[index].weight += stock.weight
      result[stock.product._id].branches[index].pieces += stock.pieces

    } else {

      result[stock.product._id].branches.push({

        branch: stock.branch,
        pieces: stock.pieces,
        weight: stock.weight
      })

      result[stock.product._id].total += stock.weight
    }
  })

  return result
}

export const getTotalStockByBranch = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date(req.params.date)

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const stock = await Stock.find({
      $and: [
        {
          createdAt: {

            $lt: topDate
          }
        },
        {
          createdAt: {

            $gte: bottomDate
          }
        },
        {
          company: companyId
        }
      ]
    }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'product', select: 'name createdAt' })

    if (stock.length > 0) {

      stock.sort((prevStock, nextStock) => prevStock.branch.position - nextStock.branch.position)

      const groupedStock = groupStockByBranchFunction(stock)

      Object.values(groupedStock).forEach((stockProduct) => {

        // stockProduct.branches.sort((a, b) => a.branch.position - b.branch.position)
        stockProduct.stockItems.sort((a, b) => a.product.createdAt - b.product.createdAt)
      })

      res.status(200).json({ stock: groupedStock })

    } else {

      next(errorHandler(404, 'Stock not found'))
    }

  } catch (error) {

    next(error)
  }
}

const groupStockByBranchFunction = (stock) => {

  const result = {}

  stock.forEach(stock => {


    if (!result[stock.branch._id]) {

      result[stock.branch._id] = {

        branch: stock.branch,
        total: 0.0,
        stockItems: []
      }
    }


    const index = result[stock.branch._id].stockItems.findIndex((stockItem) => stockItem.product._id == stock.product._id)

    if (index != -1) {

      result[stock.branch._id].stockItems[index].weight += stock.weight
      result[stock.branch._id].stockItems[index].pieces += stock.pieces

    } else {

      result[stock.branch._id].stockItems.push({

        product: stock.product,
        pieces: stock.pieces,
        weight: stock.weight
      })

    }
    result[stock.branch._id].total += stock.amount
  })

  return result
}

export const createAfternoonStock = async (req, res, next) => {

  const { pieces, weight, amount, branch, product, company, employee, createdAt } = req.body

  try {

    const newStock = new Stock({ pieces, employee, weight, amount, branch, product, company, createdAt })
    await af.save()

    await updateReportStock(branch, createdAt, amount)
    res.status(201).json({ message: 'New Afternoon Stock is created successfully', stock: newStock })

  } catch (error) {

    next(error)

  }
}