import ProductLoss from "../models/accounts/outgoings/product.loss.model.js";
import { errorHandler } from "../utils/error.js";
import { getDayRange } from "../utils/formatDate.js";

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

  const {bottomDate, topDate} = getDayRange(date)

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