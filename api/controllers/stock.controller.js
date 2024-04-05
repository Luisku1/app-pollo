import Price from "../models/accounts/price.model.js";
import Stock from "../models/accounts/stock.model.js";
import { errorHandler } from "../utils/error.js";
import { pricesAggregate } from "./price.controller.js";

export const createStock = async (req, res, next) => {

  const {pieces, weight, amount, branch, product, company, employee} = req.body
  const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(Date.now() - tzoffset)

  try {

    const newStock = new Stock({pieces, employee, weight, amount, branch, product, company, createdAt: functionalDate})
    await newStock.save()

    res.status(201).json({message: 'New stock created successfully', stock: newStock})

  } catch (error) {

    next(error)

  }
}

export const getInitialStock = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const tzoffset = (new Date(req.params.date)).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(date - tzoffset)
  const functionalDateMinusOneDay = new Date(date - tzoffset)

  functionalDateMinusOneDay.setDate(functionalDateMinusOneDay.getDate() - 1)

  try {

    const initialStock = await Stock.find({

        $and: [{

          createdAt: {

            $lt: functionalDate.toISOString().slice(0, 10)
          }
        },
        {
          createdAt: {

            $gte: functionalDateMinusOneDay.toISOString().slice(0, 10)

          }
        },
        {
          branch: branchId
        }]
    })

    console.log(initialStock)


    if(initialStock) {

      const branchPrices = await pricesAggregate(branchId)

      let total = 0.0

      if(branchPrices.error == null) {

        console.log(branchPrices.data.prices)

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

  const tzoffset = (new Date(req.params.date)).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(date - tzoffset)
  const functionalDatePlusOneDay = new Date(date - tzoffset)

  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)


  try {

    const stockItems = await Stock.find({

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

  const tzoffset = (new Date(req.params.date)).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(date - tzoffset)
  const functionalDatePlusOneDay = new Date(date - tzoffset)

  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)


  try {

    const stockItems = await Stock.find({

        $and: [{

          createdAt: {

            $gte: functionalDate.toISOString()
          }
        },
        {
          createdAt: {

            $lt: functionalDatePlusOneDay.toISOString()

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