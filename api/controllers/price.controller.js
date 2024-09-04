import Price from "../models/accounts/price.model.js";
import { errorHandler } from "../utils/error.js";
import Product from '../models/product.model.js'
import Branch from '../models/branch.model.js'
import { Types } from "mongoose";

export const newPrice = async (req, res, next) => {

  const { price, product, branch } = req.body
  const createdAt = new Date().toISOString()

  try {

    const newPrice = new Price({ price, product, branch, createdAt })

    await newPrice.save()
    res.status(200).json('New price created')

  } catch (error) {

    next(error)
  }
}

export const newPrices = async (req, res, next) => {

  const data = req.body
  const companyId = req.params.companyId
  const bulkOps = []

  try {

    for (let key in data) {

      if (data.hasOwnProperty(key)) {

        const createdAt = new Date().toISOString()

        let document = {

          price: data[key].price,
          product: data[key].product,
          branch: data[key].branch,
          company: companyId,
          createdAt: createdAt
        }

        bulkOps.push({ "insertOne": { "document": document } })

      }
    }

    Price.bulkWrite(bulkOps)
      .then(result => {
        res.status(200).json('Prices initialized correctly')
      })

  } catch (error) {

    next(error)
  }
}

export const initializeBranchPrices = async (req, res, next) => {

  const branchId = req.params.branchId
  const companyId = req.params.companyId
  let bulkOps = []


  try {

    const products = await Product.find({ company: companyId }, ['_id'])

    if (products.length > 0) {

      products.forEach((product) => {

        const createdAt = new Date().toISOString()

        let document = {

          price: 0,
          product: product._id,
          branch: branchId,
          company: companyId,
          createdAt: createdAt
        }

        bulkOps.push({ "insertOne": { "document": document } })

      })

      Price.bulkWrite(bulkOps)
        .then(result => {
          res.status(200).json('Prices initialized correctly')
        })

    } else {

      next(errorHandler(404, 'No hay productos registrados en esta companía'))
    }


  } catch (error) {

    next(error)
  }
}

export const getBranchCurrentPrices = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = req.params.date
  const reportExists = req.params.reportExists

  try {

    const currentPrices = await getPrices(branchId, date, reportExists, next)

    if (Object.getOwnPropertyNames(currentPrices).length > 0) {

      res.status(200).json({ data: currentPrices })

    } else {

      next(errorHandler(404, 'Error Ocurred'))
    }

  } catch (error) {

    next(error)
  }
}

const getPrices = async (branchId, date, reportExists, next) => {

  let topDate

  if (reportExists == 1) {

    topDate = new Date(date)

  } else {

    const actualLocaleDay = date.slice(0, 10)

    const actualLocaleDatePlusOne = new Date(actualLocaleDay)
    actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
    const actualLocaleDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

    topDate = new Date(actualLocaleDayPlusOne + 'T00:00:00.000-06:00')
  }

  try {

    const productsPrice = await pricesAggregate(branchId, topDate)

    if (productsPrice.error == null) {

      return productsPrice.data

    }


  } catch (error) {

    next(error)
  }
}



export const getAllBranchPrices = async (req, res, next) => {

  const { companyId } = req.params

  try {

    const productsPrice = await Branch.aggregate([

      {
        $lookup: {
          from: "prices",
          localField: "_id",
          foreignField: "branch",
          as: "prices"
        }
      },
      {
        $unwind: {
          path: "$prices",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          "company": new Types.ObjectId(companyId)
        }
      },
      {
        $sort: { "prices.createdAt": -1 } // Ordenamos por fecha de creación de forma descendente para obtener el precio más reciente primero
      },
      {
        $group: {
          _id: {
            branch: "$_id",
            branchName: '$branch',
            branchPosition: '$position',
            product: "$prices.product",
            company: '$company'
          },
          latestPrice: { $first: "$prices.price" }, // Obtenemos el primer precio, que será el más reciente
          date: { $first: "$prices.createdAt" } // También obtenemos la fecha del precio más reciente
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },

      {
        $sort: { "product.createdAt": 1 }
      },

      {
        $group: {
          _id: {
            branchId: "$_id.branch",
            branchName: '$_id.branchName',
            branchPosition: '$_id.branchPosition'
          },
          company: { $first: '$_id.company' },
          prices: {
            $push: {
              productId: '$product._id',
              product: "$product.name",
              latestPrice: "$latestPrice",
              date: "$date"
            }
          }
        }
      },

      {
        $sort: { '_id.branchPosition': 1 }
      }
    ])

    if (productsPrice) {

      res.status(200).json({ data: productsPrice })

    } else {

      next(errorHandler(404, 'Error ocurred'))
    }


  } catch (error) {

    next(error)
  }
}

export const getProductPrice = async (productId, branchId, topDate = new Date()) => {

  try {

    const price = await Price.find({
      $and: [
        {
          createdAt: {
            $lt: topDate
          }
        },
        {
          branch: branchId,
        },
        {
          product: productId
        }
      ]
    }, 'price').sort({ createdAt: -1 }).limit(1)

    if (price) {

      return price[0]
    }

  } catch (error) {

    console.log(error)
  }
}

export const pricesAggregate = async (branchId, topDate) => {


  try {

    const prices = await Branch.aggregate([

      {
        $lookup: {
          from: "prices",
          localField: "_id",
          foreignField: "branch",
          as: "prices",
          pipeline: [
            { $match: { createdAt: { $lt: topDate } } }
          ]
        }
      },
      {
        $unwind: {
          path: "$prices",
        }
      },
      {
        $match: {
          "_id": new Types.ObjectId(branchId)
        }
      },
      {
        $sort: { "prices.createdAt": -1 } // Ordenamos por fecha de creación de forma descendente para obtener el precio más reciente primero
      },
      {
        $group: {
          _id: {
            branch: "$_id",
            branchName: '$branch',
            product: "$prices.product",
            company: '$company'
          },
          priceId: { $first: '$prices._id' },
          latestPrice: { $first: "$prices.price" }, // Obtenemos el primer precio, que será el más reciente
          date: { $first: "$prices.createdAt" } // También obtenemos la fecha del precio más reciente
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },

      {
        $sort: { "product.createdAt": 1 }
      },

      {
        $group: {
          _id: {
            branchId: "$_id.branch",
            branchName: '$_id.branchName'
          },
          company: { $first: '$_id.company' },
          prices: {
            $push: {
              priceId: '$priceId',
              productId: '$product._id',
              product: "$product.name",
              latestPrice: "$latestPrice",
              date: "$date"
            }
          }
        }
      }
    ])

    if (prices) {

      return { error: null, data: prices[0] }

    } else {

      return { error: -1, data: null }
    }

  } catch (error) {

    return { error: error, data: null }
  }

}