import Price from "../models/accounts/price.model.js";
import Stock from "../models/accounts/stock.model.js";
import { errorHandler } from "../utils/error.js";
import { pricesAggregate } from "./price.controller.js";

export const createStock = async (req, res, next) => {

  const {pieces, weight, amount, branch, product, company, employee} = req.body
  const createdAt = new Date().toISOString()

  try {

    const newStock = new Stock({pieces, employee, weight, amount, branch, product, company, createdAt})
    await newStock.save()

    res.status(201).json({message: 'New stock created successfully', stock: newStock})

  } catch (error) {

    next(error)

  }
}

export const getInitialStock = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const functionalDate = new Date(date)
  const functionalDateMinusOneDay = new Date(date)

  functionalDateMinusOneDay.setDate(functionalDateMinusOneDay.getDate() - 1)

  const topDate = new Date(functionalDate.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')
  const bottomDate = new Date(functionalDateMinusOneDay.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')

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

    if(initialStock) {

      const branchPrices = await pricesAggregate(branchId)

      let total = 0.0

      if(branchPrices.error == null) {

        initialStock.forEach((stock) => {

          const priceIndex = branchPrices.data.prices.findIndex((price) => (price.productId.toString() == stock.product.toString()))

          total += parseFloat(branchPrices.data.prices[priceIndex].latestPrice * stock.weight)
        })

        res.status(200).json({initialStock: total})

      } else {

        next(errorHandler(404, 'An error ocurred'))
      }


    } else {

      res.status(200).json({initialStock: 0.0})
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchDayStock = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const functionalDate = new Date(date)
  const functionalDatePlusOneDay = new Date(date)

  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  const bottomDate = new Date(functionalDate.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')
  const topDate = new Date(functionalDatePlusOneDay.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')


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
    }).populate({path: 'product', select: 'name'})

    if(stockItems.length == 0) {

      next(errorHandler(404, 'Not found stock items'))

    } else {

      res.status(200).json({stock: stockItems})
    }

  } catch (error) {

    next(error)
  }
}

export const getCompanyDayStock = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date(req.params.date)

  const functionalDate = new Date(date)
  const functionalDatePlusOneDay = new Date(date)

  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  const bottomDate = new Date(functionalDate.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')
  const topDate = new Date(functionalDatePlusOneDay.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')


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

    if(stockItems.length == 0) {

      next(errorHandler(404, 'Not found stock items'))

    } else {

      res.status(200).json({stock: stockItems})
    }

  } catch (error) {

    next(error)
  }

}

export const deleteStock = async (req, res, next) => {

  const stockId = req.params.stockId

  try {

    const deleted = await Stock.deleteOne({_id: stockId})

    if(!deleted.deletedCount == 0) {

      res.status(200).json('Stock deleted successfully')

    } else {

      next(errorHandler(404, 'Stock not founded'))
    }

  } catch (error) {

    next(error)
  }
}