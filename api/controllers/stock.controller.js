import Stock from "../models/accounts/stock.model.js";
import { errorHandler } from "../utils/error.js";
import { getDayRange } from "../utils/formatDate.js";
import { fetchOrCreateBranchReport } from "./branch.report.controller.js";
import { getProductPrice, pricesAggregate } from "./price.controller.js";
import { pushOrPullBranchReportRecord } from './branch.report.controller.js'
import { Types } from "mongoose";

export const createStock = async (req, res, next) => {

  const { _id, pieces, weight, price, amount, branch, product, company, employee, createdAt, midDay } = req.body

  const stockData = { pieces, weight, price, amount, branch, product, company, employee, createdAt, midDay }

  if (_id) stockData._id = _id

  try {

    const newStock = await createStockAndUpdateBranchReport(stockData)

    res.status(201).json({ message: 'New stock created successfully', stock: newStock })

  } catch (error) {

    next(error)

  }
}

export const createStockAndUpdateBranchReport = async (params) => {
  const {
    _id = null,
    isInitial = false,
    associatedStock = null,
    pieces,
    price,
    employee,
    weight,
    amount,
    branch,
    product,
    midDay = null,
    company,
    createdAt
  } = params;

  const stockData = { pieces, price, employee, weight, amount, branch, product, company, createdAt, midDay };
  if (_id) stockData._id = _id;

  let stock = null
  let initialStock = null


  try {

    stock = isInitial ? null : await createNewStock(stockData);
    initialStock = isInitial ? { isInitial, associatedStock, ...stockData } : await createInitialStock(stock, stockData, price, branch, product, createdAt);


    if (initialStock && (!initialStock.isInitial || !initialStock.associatedStock)) {
      throw new Error("Faltan campos para el sobrante inicial");
    }

    if (!midDay)
      await saveInitialStock(initialStock, branch, initialStock.createdAt);

    return stock;
  } catch (error) {
    await handleStockCreationError(stock, initialStock);
    throw error;
  }
};

const createNewStock = async (stockData) => {
  const stock = await Stock.create({ ...stockData });
  if (!stock) throw new Error("No se logró crear el registro");

  await pushOrPullBranchReportRecord({
    branchId: stockData.branch,
    date: stockData.createdAt,
    record: stock,
    affectsBalancePositively: stock.midDay ? null : true,
    operation: '$addToSet',
    arrayField: stock.midDay ? 'midDayStockArray' : 'finalStockArray',
    amountField: stock.midDay ? 'midDayStock' : 'finalStock'
  });

  return stock;
};

const createInitialStock = async (stock, stockData, price, branch, product, createdAt) => {
  const nextBranchReportDate = new Date(createdAt);
  nextBranchReportDate.setDate(nextBranchReportDate.getDate() + 1);
  const { bottomDate } = getDayRange(nextBranchReportDate);
  const branchReport = await fetchOrCreateBranchReport({ branchId: branch, date: nextBranchReportDate });

  if (!branchReport) throw new Error("No se logró obtener el reporte de la sucursal");

  const nextReportPrice = await getProductPrice(product, branch, branchReport.pricesDate || bottomDate);
  const initialStockId = new Types.ObjectId().toHexString();
  const initialStock = { ...stock._doc, _id: initialStockId, isInitial: true, associatedStock: stock._id, createdAt: bottomDate };

  if (nextReportPrice != price) {
    initialStock.price = nextReportPrice;
    initialStock.amount = initialStock.weight * nextReportPrice;
  }

  return initialStock;
};

const saveInitialStock = async (initialStock, branch, createdAt) => {
  const savedInitialStock = await Stock.create({ ...initialStock });
  if (!savedInitialStock) throw new Error("No se pudo crear el inicial");

  await pushOrPullBranchReportRecord({
    branchId: branch,
    date: createdAt,
    record: savedInitialStock,
    affectsBalancePositively: false,
    operation: '$addToSet',
    arrayField: 'initialStockArray',
    amountField: 'initialStock'
  });
};

const handleStockCreationError = async (stock, initialStock) => {
  if (stock) {
    await deleteStockAndUpdateBranchReport({ stockId: stock._id });
  }

  if (initialStock && initialStock._id) {
    await deleteStockAndUpdateBranchReport({ stockId: initialStock._id, isInitial: true });
  }
};

export const getInitialStock = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  try {

    const initialStock = await getInitialStockValue({ branchId, date })

    if (initialStock) {

      res.status(200).json({ initialStock: initialStock })

    } else {

      errorHandler(404, 'Error al consultar el sobrante inicial')
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchDayStock = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  try {

    const stockItems = await getBranchStock({ branchId, date })

    if (stockItems.length == 0) {

      next(errorHandler(404, 'Not found stock items'))

    } else {

      let totalStock = 0

      stockItems.map((stock) => {

        totalStock += stock.amount
      })

      res.status(200).json({ stock: stockItems, totalStock: totalStock })
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchStock = async ({ branchId, date }) => {

  const { bottomDate, topDate } = getDayRange(date)

  const stock = await Stock.find({

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
  }).populate({ path: 'product', select: 'name' })

  return stock.length > 0 ? stock : []

}

export const getCompanyDayStock = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date(req.params.date)

  const { bottomDate, topDate } = getDayRange(date)


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

    if (stockItems.length == 0) {

      next(errorHandler(404, 'Not found stock items'))

    } else {

      res.status(200).json({ stock: stockItems })
    }

  } catch (error) {

    next(error)
  }

}

export const deleteStock = async (req, res, next) => {

  const stockId = req.params.stockId

  try {

    await deleteStockAndUpdateBranchReport({ stockId, alsoDeleteInitial: true })

    res.status(200).json({ message: 'Registro eliminado' })

  } catch (error) {

    next(error)
  }
}

export const deleteStockAndUpdateBranchReport = async ({ stockId, isInitial = false, alsoDeleteInitial = false }) => {

  let deletedStock = null;
  let deletedInitialStock = null;

  try {
    deletedStock = await Stock.findByIdAndDelete(stockId);
    if (!deletedStock) throw new Error("No se logró eliminar el registro");

    await pushOrPullBranchReportRecord({
      branchId: deletedStock.branch,
      date: deletedStock.createdAt,
      record: deletedStock,
      affectsBalancePositively: deletedStock.midDay ? null : !isInitial,
      operation: '$pull',
      arrayField: deletedStock.midDay ? 'midDayStockArray' : isInitial ? 'initialStockArray' : 'finalStockArray',
      amountField: deletedStock.midDay ? 'midDayStock' : isInitial ? 'initialStock' : 'finalStock'
    });

    if (alsoDeleteInitial) {
      const initialStock = await Stock.findOne({ associatedStock: stockId });
      if (initialStock) {

        deletedInitialStock = await Stock.findByIdAndDelete(initialStock._id);
        if (!deletedInitialStock) throw new Error("No se logró borrar el inicial");

        await pushOrPullBranchReportRecord({
          branchId: deletedInitialStock.branch,
          date: deletedInitialStock.createdAt,
          record: deletedInitialStock,
          affectsBalancePositively: false,
          operation: '$pull',
          arrayField: 'initialStockArray',
          amountField: 'initialStock'
        });
      }
    }
  } catch (error) {

    if (deletedStock) {
      await createStockAndUpdateBranchReport(deletedStock);
    }

    if (deletedInitialStock) {
      await createStockAndUpdateBranchReport(deletedInitialStock);
    }
    throw error;
  }
};

export const getTotalStockByProduct = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date(req.params.date)

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const stock = await Stock.find({
      $and: [
        {
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
          company: companyId
        },
        {
          isInitial: false
        }
      ]
    }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'product', select: 'name createdAt' })

    if (stock.length > 0) {

      stock.sort((prevStock, nextStock) => prevStock.product.createdAt - nextStock.product.createdAt)

      const groupedStock = groupStockByProductFunction(stock)

      Object.values(groupedStock).forEach((stockProduct) => {

        // stockProduct.branches.sort((a, b) => a.branch.position - b.branch.position)
        stockProduct.branches.sort((a, b) => b.weight - a.weight)
      })

      res.status(200).json({ stock: groupedStock })

    } else {

      next(errorHandler(404, 'Stock not found'))
    }

  } catch (error) {

    next(error)
  }
}

const groupStockByProductFunction = (stock) => {

  const result = {}

  stock.forEach(stock => {


    if (!result[stock.product._id]) {

      result[stock.product._id] = {

        product: stock.product,
        total: 0.0,
        branches: []
      }
    }


    const index = result[stock.product._id].branches.findIndex((branch) => stock.branch._id == branch.branch._id)

    if (index != -1) {

      result[stock.product._id].total = stock.weight + result[stock.product._id].total
      result[stock.product._id].branches[index].weight += stock.weight
      result[stock.product._id].branches[index].pieces += stock.pieces

    } else {

      result[stock.product._id].branches.push({

        branch: stock.branch,
        pieces: stock.pieces,
        weight: stock.weight
      })

      result[stock.product._id].total += stock.weight
    }
  })

  return result
}

export const getTotalStockByBranch = async (req, res, next) => {

  const companyId = req.params.companyId
  const date = new Date(req.params.date)

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const stock = await Stock.find({
      $and: [
        {
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
          company: companyId
        },
        {
          isInitial: false
        }
      ]
    }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'product', select: 'name createdAt' })

    if (stock.length > 0) {

      stock.sort((prevStock, nextStock) => prevStock.branch.position - nextStock.branch.position)

      const groupedStock = groupStockByBranchFunction(stock)

      Object.values(groupedStock).forEach((stockProduct) => {

        // stockProduct.branches.sort((a, b) => a.branch.position - b.branch.position)
        stockProduct.stockItems.sort((a, b) => a.product.createdAt - b.product.createdAt)
      })

      res.status(200).json({ stock: groupedStock })

    } else {

      next(errorHandler(404, 'Stock not found'))
    }

  } catch (error) {

    next(error)
  }
}

const groupStockByBranchFunction = (stock) => {

  const result = {}

  stock.forEach(stock => {


    if (!result[stock.branch._id]) {

      result[stock.branch._id] = {

        branch: stock.branch,
        total: 0.0,
        stockItems: []
      }
    }


    const index = result[stock.branch._id].stockItems.findIndex((stockItem) => stockItem.product._id == stock.product._id)

    if (index != -1) {

      result[stock.branch._id].stockItems[index].weight += stock.weight
      result[stock.branch._id].stockItems[index].pieces += stock.pieces

    } else {

      result[stock.branch._id].stockItems.push({
        product: stock.product,
        pieces: stock.pieces,
        weight: stock.weight
      })

    }
    result[stock.branch._id].total += stock.amount
  })

  return result
}