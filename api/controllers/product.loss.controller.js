import ProductLoss from "../models/accounts/outgoings/product.loss.model.js";
import { errorHandler } from "../utils/error.js";

export const create = async (req, res, next) => {

  const { amount, productLossWeight, comment, product, employee, company, branch } = req.body
  const createdAt = new Date().toISOString()

  try {

    const newProductLossItem = await new ProductLoss({ amount, weight: productLossWeight, comment, product, employee, company, branch, createdAt: createdAt })
    newProductLossItem.save()

    res.status(201).json({ message: 'Product Loss Item created successfully', productLoss: newProductLossItem })

  } catch (error) {

    next(error)
  }
}

export const getProductLosses = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date(req.params.date)

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')

  try {

    const productLosses = await ProductLoss.find({

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

    if(productLosses.length > 0) {

      res.status(200).json({productLosses: productLosses})

    } else {

      next(errorHandler(404, 'Not found product losses'))
    }

  } catch (error) {

    next(error)
  }
}

export const deleteProductLoss = async (req, res, next) => {

  const id = req.params.productLossId

  try {

    const deleted = await ProductLoss.deleteOne({ _id: id })

    if (!deleted.deletedCount == 0) {

      res.status(200).json('Product loss item deleted successfully')

    } else {

      next(errorHandler(404, 'Product loss item not founded'))
    }

  } catch (error) {

    next(error)

  }

}