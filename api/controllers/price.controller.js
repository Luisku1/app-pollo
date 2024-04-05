import Price from "../models/accounts/price.model.js";
import { errorHandler } from "../utils/error.js";
import Product from '../models/product.model.js'
import Branch from '../models/branch.model.js'
import { Types } from "mongoose";

export const newPrice = async (req, res, next) => {

  const { price, product, branch } = req.body
  const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(Date.now() - tzoffset)

  try {

    const newPrice = new Price({ price, product, branch, createdAt: functionalDate })

    await newPrice.save()
    res.status(200).json('New price created')

  } catch (error) {

    next(error)
  }
}

export const newPrices = async (req, res, next) => {

  const data = req.body
  const bulkOps = []

  try {

    for(let key in data) {

      if(data.hasOwnProperty(key)) {

        const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
        const functionalDate = new Date(Date.now() - tzoffset)

        let document = {

          price: data[key].price,
          product: data[key].product,
          branch: data[key].branch,
          createdAt: functionalDate
        }

        bulkOps.push({ "insertOne": {"document": document}})

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

    const products = await Product.find({company: companyId}, ['_id'])

    products.forEach((product) => {

      const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
      const functionalDate = new Date(Date.now() - tzoffset)

      let document = {

        price: 0,
        product: product._id,
        branch: branchId,
        createdAt: functionalDate
      }

      bulkOps.push({ "insertOne": {"document": document}})

    })

    Price.bulkWrite(bulkOps)
    .then(result => {
      res.status(200).json('Prices initialized correctly')
    })

  } catch (error) {

    next(error)
  }
}

export const getBranchCurrentPrices = async (req, res, next) => {

  const branchId = req.params.branchId

  try {

    const productsPrice = await pricesAggregate(branchId)

    if (productsPrice.error == null) {

      res.status(200).json({data: productsPrice.data})

    } else {

      next(errorHandler(404, 'Error ocurred'))
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
        $sort: {"product.createdAt": 1}
      },

      {
        $group: {
          _id: {
            branchId: "$_id.branch",
            branchName: '$_id.branchName',
            branchPosition: '$_id.branchPosition'
          },
          company: {$first: '$_id.company'},
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
        $sort: {'_id.branchPosition': 1}
      }
    ])

    if (productsPrice) {

      res.status(200).json({data: productsPrice})

    } else {

      next(errorHandler(404, 'Error ocurred'))
    }


  } catch (error) {

    next(error)
  }
}

export const getProductPrice = async (productId, branchId) => {

  try {

    const price = await Price.find({ branch: branchId, product: productId }, 'price').sort({ createdAt: -1 })

    if (price) {

      return price[0]

    }

  } catch (error) {

    console.log(error)
  }
}

export const pricesAggregate = async (branchId) => {

  try {

    const prices = await Branch.aggregate([

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
          priceId: {$first: '$prices._id'},
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
        $sort: {"product.createdAt": 1}
      },

      {
        $group: {
          _id: {
            branchId: "$_id.branch",
            branchName: '$_id.branchName'
          },
          company: {$first: '$_id.company'},
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

    if(prices) {

      return {error: null, data: prices[0]}

    } else {

      return {error: -1, data: null}
    }

  } catch (error) {

    return {error: error, data: null}
  }

}