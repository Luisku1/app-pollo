import Stock from "../models/accounts/stock.model.js";
import { errorHandler } from "../utils/error.js";

export const createStock = async (req, res, next) => {

  const {pieces, weight, amount, branch, product} = req.body

  try {

    const newStock = new Stock({pieces, weight, amount, branch, product})
    await newStock.save()

    res.status(201).json({message: 'New stock created successfully', stock: newStock})

  } catch (error) {

    next(error)

  }
}

export const getDailyStock = async (req, res, next) => {

  const date = new Date(req.params.date)
  console.log(date)
  const branchId = req.params.branchId
  const localeDate = date.toDateString('es-MX', {timeZone: 'US/Central'})
  const functionalDate = new Date(localeDate)
  console.log(functionalDate)
  const functionalDateMinusOneDay = new Date(localeDate)
  functionalDateMinusOneDay.setDate(functionalDateMinusOneDay.getDate() + 1)


  try {

    const stockItems = await Stock.find({

        $and: [{

          createdAt: {

            $gte: functionalDate.toISOString()
          }
        },
        {
          createdAt: {

            $lte: functionalDateMinusOneDay.toISOString()

          }
        },
        {
          branch: branchId
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