import Price from "../models/accounts/price.model.js";
import { errorHandler } from "../utils/error.js";
import Product from '../models/product.model.js'
import Branch from '../models/branch.model.js'
import { Types } from "mongoose";
import { getDayRange, today } from "../utils/formatDate.js";
import { changePricesDate, fetchBranchReport, fetchOrCreateBranchReport } from "./branch.report.controller.js";
import ProviderInput from "../models/providers/provider.input.model.js";
import Input from "../models/accounts/input.model.js";
import Output from "../models/accounts/output.model.js";
import { dateFromYYYYMMDD, formatDateYYYYMMDD, isYYYYMMDD } from "../../common/dateOps.js";

export const newPrice = async (req, res, next) => {

  const { price, product, branch, residual = false } = req.body
  const createdAt = new Date().toISOString()

  try {

    const newPrice = new Price({ price, product, branch, createdAt, residual })

    await newPrice.save()
    res.status(200).json('New price created')

  } catch (error) {

    next(error)
  }
}

export const changeBranchPrices = async (req, res, next) => {

  const branchId = req.params.branchId
  const { date, pricesDate, residuals = false } = req.body

  if (!date || !branchId || !pricesDate) {

    next(errorHandler(400, 'Faltan datos necesarios'))
  }

  try {

    const updatedBranchReport = await changePricesDate(branchId, date, pricesDate, residuals)

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

    const createdAt = new Date().toISOString()

    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        if (Object.keys(data[key]).length === 0 || !data[key].price || !data[key].product || !data[key].branch) {
          continue
        }
        let document = {
          price: data[key].price,
          product: data[key].product,
          branch: data[key].branch,
          residual: data[key].residual || false,
          company: companyId,
          createdAt: createdAt
        }
        bulkOps.push({ "insertOne": { "document": document } })
      }
    }
    await Price.bulkWrite(bulkOps)

    if (data.applyChanges) {
      const { document } = bulkOps[0].insertOne;
      if (data.applyChanges) {
        changePricesDate(document.branch, document.createdAt, document.createdAt, document.residual);
      }
    }
    res.status(200).json('Prices created correctly')
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

    let lastDate = null

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

        lastDate = createdAt

        bulkOps.push({ "insertOne": { "document": document } })

      })

      await fetchOrCreateBranchReport({ branchId, companyId, date: createdAt, pricesDate: lastDate })

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
  const date = dateFromYYYYMMDD(req.params.date);
  const pricesDate = req.params.pricesDate != "null" ? new Date(req.params.pricesDate) : null;
  const sortOrder = req.params.sortOrder == "null" ? null : req.params.sortOrder;
  const residuals = req.query.residuals === 'true' ? true : false;

  try {
    const currentPrices = await getPrices({ branchId, date, pricesDate, sortOrder, residuals });
    if (currentPrices) {
      res.status(200).json({ branchPrices: currentPrices });
    } else {
      next(errorHandler(404, 'Error Ocurred'));
    }

  } catch (error) {
    next(error);
  }
}

export const getPrices = async ({ branchId, date, pricesDate = null, sortOrder = null, residuals }) => {

  let finalDate = null

  const branchReport = await fetchBranchReport({ branchId, date })

  finalDate = !branchReport ? getDayRange(new Date(date)).bottomDate : (pricesDate ? new Date(pricesDate) : (branchReport.pricesDate ? new Date(branchReport.pricesDate) : getDayRange(new Date(date)).bottomDate))

  const productsPrice = await pricesAggregate(branchId, finalDate, sortOrder, residuals)

  return productsPrice
}

export const getAllBranchPrices = async (req, res, next) => {

  const { companyId } = req.params

  try {

    const productsPrice = await Branch.aggregate([

      {
        $match: {
          "company": new Types.ObjectId(companyId)
        }
      },
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
        $sort: { "prices.createdAt": -1 } // Ordenamos por fecha de creación de forma descendente para obtener el precio más reciente primero
      },
      {
        $group: {
          _id: {
            branch: "$_id",
            branchName: '$branch',
            branchPosition: '$position',
            residualPrices: '$residualPrices',
            product: "$prices.product",
            company: '$company'
          },
          latestPrice: {
            $first: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$prices.residual", false] },
                    { $not: ["$prices.residual"] } // Para legacy sin campo residual
                  ]
                },
                "$prices.price",
                null
              ]
            }
          }, // Solo el precio normal (no residual)
          latestResidualPrice: {
            $first: {
              $cond: [
                { $eq: ["$prices.residual", true] }, "$prices.price", null
              ]
            }
          },
          date: { $first: "$prices.createdAt" } // También obtenemos la fecha del precio más reciente
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      // Lookup para fórmula
      {
        $lookup: {
          from: "branchproductformulas",
          let: { branchId: "$_id.branch", productId: "$product._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$branchId", "$$branchId"] },
                    { $eq: ["$productId", "$$productId"] }
                  ]
                }
              }
            },
            { $project: { formula: 1, _id: 1 } }
          ],
          as: "formulaData"
        }
      },
      { $addFields: { formula: { $arrayElemAt: ["$formulaData", 0] } } },
      { $project: { formulaData: 0 } },
      { $sort: { "product.createdAt": 1 } },
      {
        $group: {
          _id: {
            branchId: "$_id.branch",
            branchName: '$_id.branchName',
            branchPosition: '$_id.branchPosition',
            residualPrices: '$_id.residualPrices'
          },
          company: { $first: '$_id.company' },
          prices: {
            $push: {
              productId: '$product._id',
              product: "$product.name",
              latestPrice: "$latestPrice",
              latestResidualPrice: "$latestResidualPrice",
              date: "$date",
              formula: "$formula"
            }
          }
        }
      },
      { $sort: { '_id.branchPosition': 1 } }
    ])

    if (productsPrice) {

      res.status(200).json({ data: productsPrice })

    } else {
      next(errorHandler(404, 'Error ocurred'))
    }


  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const getBranchProductPrice = async (req, res, next) => {

  const { branchId, productId } = req.params
  const date = isYYYYMMDD(req.params.date) ? dateFromYYYYMMDD(req.params.date).toISOString() : req.params.date;
  let finalDate

  if (!branchId || !productId || !date) {
    return next(errorHandler(400, 'Faltan datos necesarios'))
  }

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
  const { customerId, productId } = req.params;
  // Fecha límite para buscar
  const date = dateFromYYYYMMDD(formatDateYYYYMMDD((new Date(req.params.date)) ?? new Date())).toISOString();

  try {
    // Buscar el último registro de ProviderInput, Input y Output para ese cliente y producto
    const [customerLastProviderInput, customerLastInput, customerLastOutput] = await Promise.all([
      ProviderInput.findOne({
        customer: customerId,
        product: productId,
        createdAt: { $lte: date }
      }).sort({ createdAt: -1 }),
      Input.findOne({
        customer: customerId,
        product: productId,
        createdAt: { $lte: date }
      }).sort({ createdAt: -1 }),
      Output.findOne({
        customer: customerId,
        product: productId,
        createdAt: { $lte: date }
      }).sort({ createdAt: -1 })
    ]);

    // Manejo de casos donde no se encuentran registros
    if (!customerLastProviderInput && !customerLastInput && !customerLastOutput) {
      return res.status(404).json({ price: 0.0 });
    }

    // Encuentra el registro más reciente entre los tres
    const all = [customerLastProviderInput, customerLastInput, customerLastOutput].filter(Boolean);
    const latest = all.reduce((acc, curr) => {
      if (!acc) return curr;
      return curr.createdAt > acc.createdAt ? curr : acc;
    }, null);

    return res.status(200).json({ price: latest.price });
  } catch (error) {
    next(error);
  }
};

export const getProductPrice = async (productId, branchId, topDate = new Date(), residualPrice = false) => {

  try {

    const matchCondition = {
      product: productId,
      branch: branchId,
      createdAt: {
        $lte: topDate
      }
    }

    if (residualPrice) {
      matchCondition.residual = true
    }

    let price = await Price.find(matchCondition, 'price').sort({ createdAt: -1 }).limit(1)

    if ((!price || price.length === 0) && residualPrice) {
      matchCondition.residual = false
      price = await Price.find(matchCondition, 'price').sort({ createdAt: -1 }).limit(1)
    }
    return price[0]?.price ?? null

  } catch (error) {

    console.log(error)
  }
}

export const pricesAggregate = async (branchId, topDate, sortOrder = null, residuals = false) => {

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
    // Construir el filtro para el campo residual
  }

  const residualMatch = residuals
    ? { residual: true }
    : {
      $or: [
        { residual: false },
        { residual: { $exists: false } }
      ]
    };

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
            {
              $match: {
                createdAt: { $lte: new Date(actualPricesDate) },
                ...residualMatch
              }
            },
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
          latestPrice: { $first: "$prices.price" },
          date: { $first: "$prices.createdAt" }
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
            residualPrices: '$_id.residualPrices'
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