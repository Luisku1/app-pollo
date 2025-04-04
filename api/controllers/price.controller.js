import Price from "../models/accounts/price.model.js";
import { errorHandler } from "../utils/error.js";
import Product from '../models/product.model.js'
import Branch from '../models/branch.model.js'
import { Types } from "mongoose";
import { getDayRange, today } from "../utils/formatDate.js";
import { changePricesDate, fetchBranchReport } from "./branch.report.controller.js";
import ProviderInput from "../models/providers/provider.input.model.js";
import Input from "../models/accounts/input.model.js";
import Output from "../models/accounts/output.model.js";

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

export const changeBranchPrices = async (req, res, next) => {

  const branchId = req.params.branchId
  const { date, pricesDate } = req.body

  if (!date || !branchId || !pricesDate) {

    next(errorHandler(400, 'Faltan datos necesarios'))
  }

  try {

    const updatedBranchReport = await changePricesDate(branchId, date, pricesDate)

    if (!updatedBranchReport) next(errorHandler(404, 'No se pudo realizar el cambio de precios'))

    res.status(200).json({
      success: true,
      message: 'Precios actualizados correctamente',
      data: updatedBranchReport
    })

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

  const branchId = req.params.branchId;
  const date = new Date(req.params.date);
  const pricesDate = req.params.pricesDate != "null" ? new Date(req.params.pricesDate) : null;
  const sortOrder = req.params.sortOrder == "null" ? null : req.params.sortOrder;

  try {
    const currentPrices = await getPrices({branchId, date, pricesDate, sortOrder});

    if (currentPrices) {
      res.status(200).json({ branchPrices: currentPrices });
    } else {
      next(errorHandler(404, 'Error Ocurred'));
    }

  } catch (error) {
    next(error);
  }
}

export const getPrices = async ({branchId, date, pricesDate = null, sortOrder = null}) => {

  let finalDate = null

  const branchReport = await fetchBranchReport({ branchId, date })

  finalDate = !branchReport ? getDayRange(new Date(date)).bottomDate : (pricesDate ? new Date(pricesDate) : (branchReport.pricesDate ? new Date(branchReport.pricesDate) : getDayRange(new Date(date)).bottomDate))

  const productsPrice = await pricesAggregate(branchId, finalDate, sortOrder)

  return productsPrice
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

export const getBranchProductPrice = async (req, res, next) => {

  const { branchId, productId, date } = req.params
  let finalDate

  try {

    const branchReport = await fetchBranchReport({ branchId, date })

    if (branchReport && Object.getOwnPropertyNames(branchReport).length > 0 && branchReport.dateSent) {

      finalDate = new Date(branchReport.dateSent)

    } else {

      const { topDate } = getDayRange(new Date(date))
      finalDate = today(date) ? new Date() : new Date(topDate)
    }

    const productPrice = await getProductPrice(productId, branchId, finalDate)

    if (productPrice) {

      res.status(200).json({ price: productPrice || 0.0 })

    } else {

      next(errorHandler(404, 'No se encontró el precio de ese producto en esa sucursal'))
    }

  } catch (error) {

    next(error)
  }

}

export const getCustomerProductPrice = async (req, res, next) => {

  const { customerId, productId, date } = req.params

  try {

    const [customerLastProviderInput, customerLastInput, customerLastOutput] = await Promise.all([
      ProviderInput.findOne({
        $and: [
          {
            customer: customerId
          },
          {
            product: productId
          },
          {
            createdAt: { $lte: new Date(date) }
          }
        ]
      }).sort({ createdAt: -1 }),

      Input.findOne({
        $and: [
          {
            customer: customerId
          },
          {
            product: productId
          },
          {
            createdAt: { $lte: new Date(date) }
          }
        ]
      }).sort({ createdAt: -1 }),

      Output.findOne({
        $and: [
          {
            customer: customerId
          },
          {
            product: productId
          },
          {
            createdAt: { $lte: new Date(date) }
          }
        ]
      }).sort({ createdAt: -1 })
    ])

    // Manejo de casos donde no se encuentran registros
    if (!customerLastProviderInput && !customerLastInput && !customerLastOutput) {
      return res.status(404).json({ price: 0.0 });
    }

    // Obtiene los precios de ambos registros
    const providerPrice = customerLastProviderInput ? customerLastProviderInput.price : 0.0;
    const inputPrice = customerLastInput ? customerLastInput.price : 0.0;
    const outputPrice = customerLastOutput ? customerLastOutput.price : 0.0

    // Devuelve el precio más reciente
    if (customerLastInput && customerLastProviderInput && outputPrice) {
      if (customerLastInput.createdAt > customerLastProviderInput.createdAt && customerLastInput.createdAt > customerLastOutput.createdAt) {
        return res.status(200).json({ price: inputPrice });
      } else if (customerLastProviderInput.createdAt > customerLastInput.createdAt && customerLastProviderInput.createdAt > customerLastOutput.createdAt) {
        return res.status(200).json({ price: providerPrice });
      } else if (customerLastOutput.createdAt > customerLastInput.createdAt && customerLastOutput.createdAt > customerLastProviderInput.createdAt) {
        return res.status(200).json({ price: outputPrice })
      } else if (customerLastInput == customerLastOutput && customerLastOutput == customerLastProviderInput) {

        return res.status(200).json({ price: Math.max(inputPrice, providerPrice, customerLastOutput) });
      }
    }

    // Si solo hay un registro, devuelve su precio
    return res.status(200).json({ price: providerPrice || inputPrice || outputPrice });


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
            $lte: topDate
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

    return price[0].price ?? null

  } catch (error) {

    console.log(error)
  }
}

export const pricesAggregate = async (branchId, topDate, sortOrder = null) => {

  let actualPricesDate = topDate

  if (sortOrder === 'next') {
    const nextPrice = await Price.findOne({ branch: branchId, createdAt: { $gt: new Date(topDate) } })
      .sort({ createdAt: 1 })
      .limit(1);
    actualPricesDate = nextPrice ? nextPrice.createdAt : topDate;
  } else if (sortOrder === 'prev') {
    const prevPrice = await Price.findOne({ branch: branchId, createdAt: { $lt: new Date(topDate) } })
      .sort({ createdAt: -1 })
      .limit(1);
    actualPricesDate = prevPrice ? prevPrice.createdAt : topDate;
  }

  try {

    const prices = await Branch.aggregate([

      {
        $match: {
          "_id": new Types.ObjectId(branchId)
        }
      },
      {
        $lookup: {
          from: "prices",
          localField: "_id",
          foreignField: "branch",
          as: "prices",
          pipeline: [
            { $match: { createdAt: { $lte: new Date(actualPricesDate) } } },
            { $sort: { createdAt: -1 } }
          ]
        }
      },
      {
        $unwind: {
          path: "$prices",
        }
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

    return prices[0]?.prices || null;

  } catch (error) {
    console.error('Error in pricesAggregate:', error);
    throw error;
  }
}