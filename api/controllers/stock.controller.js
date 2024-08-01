import Price from "../models/accounts/price.model.js";
import Stock from "../models/accounts/stock.model.js";
import { errorHandler } from "../utils/error.js";
import { getDayRange } from "../utils/formatDate.js";
import { updateReportStock } from "../utils/updateReport.js";
import { pricesAggregate } from "./price.controller.js";

export const createStock = async (req, res, next) => {

  const { pieces, weight, amount, branch, product, company, employee, createdAt } = req.body

  try {

    const newStock = new Stock({ pieces, employee, weight, amount, branch, product, company, createdAt })
    await newStock.save()

    await updateReportStock(branch, createdAt, amount)
    res.status(201).json({ message: 'New stock created successfully', stock: newStock })

  } catch (error) {

    next(error)

  }
}

export const getInitialStock = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId
  const reportExists = req.params.reportExists
  const reportDate = req.params.reportDate

  try {

    const initialStock = await getStockValue(date, branchId, reportExists, reportDate, next)

    if (initialStock) {

      res.status(200).json({ initialStock: initialStock })

    } else {

      errorHandler(404, 'Error Ocurred')
    }

  } catch (error) {

    next(error)
  }
}

const getStockValue = async (date, branchId, reportExists, reportDate, next) => {

  let pricesDate

  const actualLocaleDateMinusOne = new Date(date)
  actualLocaleDateMinusOne.setDate(actualLocaleDateMinusOne.getDate() - 1)

  const actualLocaleDayMinusOne = actualLocaleDateMinusOne.toISOString().slice(0, 10)
  const actualLocaleDay = date.toISOString().slice(0, 10)

  const topDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const bottomDate = new Date(actualLocaleDayMinusOne + 'T00:00:00.000-06:00')

  if (reportExists == 1) {

    pricesDate = new Date(reportDate)

  } else {

    const actualLocaleDatePlusOne = new Date(date)
    actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
    const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)
    pricesDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')
  }

  try {

    const initialStock = await Stock.find({

      $and: [{

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
        branch: branchId
      }]
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

  } catch (error) {

    next(error)
  }
}

export const getBranchDayStock = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const {bottomDate, topDate} = getDayRange(date)


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
        branch: branchId
      }]
    }).populate({ path: 'product', select: 'name' })

    if (stockItems.length == 0) {

      next(errorHandler(404, 'Not found stock items'))

    } else {

      res.status(200).json({ stock: stockItems })
    }

  } catch (error) {

    next(error)
  }
}

export const getCompanyDayStock = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date(req.params.date)

  const {bottomDate, topDate} = getDayRange(date)


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

  try {

    const stock = await Stock.findById(stockId)
    const deleted = await Stock.deleteOne({ _id: stockId })

    if (!deleted.deletedCount == 0) {

      await updateReportStock(stock.branch, stock.createdAt, -(stock.amount))
      res.status(200).json('Stock deleted successfully')

    } else {

      next(errorHandler(404, 'Stock not founded'))
    }

  } catch (error) {

    next(error)
  }
}

export const getTotalStockByProduct = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date(req.params.date)

  const {bottomDate, topDate} = getDayRange(date)

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

  const {bottomDate, topDate} = getDayRange(date)

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