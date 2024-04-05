import ProductLoss from "../models/accounts/outgoings/product.loss.model.js";
import { errorHandler } from "../utils/error.js";

export const create = async (req, res, next) => {

  const { amount, productLossWeight, comment, product, employee, company, branch } = req.body
  const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(Date.now() - tzoffset)


  const newProductLossItem = new ProductLoss({ amount, weight: productLossWeight, comment, product, employee, company, branch, createdAt: functionalDate })

  try {

    await newProductLossItem.save()
    res.status(201).json({ message: 'Product Loss Item created successfully', productLossItem: newProductLossItem })

  } catch (error) {

    next(error)
  }
}

export const getProductLosses = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date(req.params.date)
  const localeDate = date.toDateString('es-MX', { timeZone: 'US/Central' })
  const functionalDate = new Date(localeDate)
  const functionalDateMinusOneDay = new Date(localeDate)
  functionalDateMinusOneDay.setDate(functionalDateMinusOneDay.getDate() + 1)

  try {

    const productLosses = await ProductLoss.find({

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
    }).populate({path: 'product', select: 'name'})

    if(productLosses.length == 0) {

      next(errorHandler(404, 'Not found product losses'))

    } else {

      res.status(200).json({productLosses: productLosses})
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