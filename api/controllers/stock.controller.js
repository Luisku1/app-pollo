import BranchReport from "../models/accounts/branch.report.model.js";
import Stock from "../models/accounts/stock.model.js";
import { errorHandler } from "../utils/error.js";
import { getDayRange, today } from "../utils/formatDate.js";
import { updateReportStock } from "../utils/updateReport.js";
import { createDefaultBranchReport, fetchBranchReport, removeRecordFromBranchReport } from "./branch.report.controller.js";
import { getProductPrice, pricesAggregate } from "./price.controller.js";
import { updateEmployeeDailyBalancesBalance } from "./employee.controller.js";

export const createStock = async (req, res, next) => {

  const { pieces, weight, price, amount, branch, product, company, employee, createdAt } = req.body

  try {

    const newStock = await createStockAndUpdateBranchReport({ pieces, price, employee, weight, amount, branch, product, company, createdAt })

    res.status(201).json({ message: 'New stock created successfully', stock: newStock })

  } catch (error) {

    next(error)

  }
}

export const createStockAndUpdateBranchReport = async ({ pieces, price, employee, weight, amount, branch, product, company, createdAt }) => {

  let branchReport = null
  let nextBranchReport = null
  let stock = null
  let updatedEmployeeDailyBalance = null
  let updatedBranchReport = null
  let updatedNextBranchReport = null

  try {

    branchReport = await fetchBranchReport({ branchId: branch, date: createdAt })

    if (!branchReport) {

      branchReport = await createDefaultBranchReport({ branchId: branch, date: createdAt, companyId: company })
    }

    if (!branchReport) throw new Error("No se encontró ni se pudo crear el reporte");

    stock = await Stock.create({ pieces, price, employee, weight, amount, branch, product, company, createdAt })

    if (!stock) throw new Error("No se logró crear el registro");

    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {

      $push: { finalStockArray: stock._id },
      $inc: { finalStock: stock.amount, balance: stock.amount }

    }, { new: true })

    if (updatedBranchReport) {

      if (updatedBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: updatedBranchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

    } else {

      throw new Error("Hubo un problema encontrando el reporte a modificar");
    }

    const nextBranchReportDate = new Date(createdAt)
    nextBranchReportDate.setDate(nextBranchReportDate.getDate() + 1)

    nextBranchReport = await fetchBranchReport({ branchId: branch, date: nextBranchReportDate })

    if (!nextBranchReport) {

      nextBranchReport = await createDefaultBranchReport({ branchId: branch, date: nextBranchReportDate, companyId: company })
    }

    if (!nextBranchReport) throw new Error("No se encontró ni se pudo crear el reporte del día siguiente");

    updatedNextBranchReport = await BranchReport.findByIdAndUpdate(nextBranchReport._id, {

      $push: { initialStockArray: stock._id },
      $inc: { initialStock: stock.amount, balance: -stock.amount }

    }, { new: true })

    if (updatedNextBranchReport) {

      if (updatedNextBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: updatedNextBranchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

      return stock

    } else {

      throw new Error("Hubo un problema encontrando el reporte a modificar");
    }

  } catch (error) {

    if (stock) {

      await Stock.findByIdAndDelete(stock._id)
    }

    if (!updatedEmployeeDailyBalance && updatedBranchReport
      && (branchReport.balance != updatedBranchReport.balance
        || branchReport.finalStockArray != updatedBranchReport.finalStockArray
        || branchReport.finalStock != updatedBranchReport.finalStock)) {

      await BranchReport.findByIdAndUpdate(branchReport._id, { balance: branchReport.balance, finalStockArray: branchReport.finalStockArray, finalStock: branchReport.finalStock })
    }

    if (!updatedEmployeeDailyBalance && updatedNextBranchReport
      && (nextBranchReport.balance != updatedNextBranchReport.balance
        || updatedNextBranchReport.initialStockArray != nextBranchReport.initialStockArray
        || nextBranchReport.initialStock != updatedNextBranchReport.initialStock)) {

      await BranchReport.findByIdAndUpdate(nextBranchReport._id, { balance: nextBranchReport.balance, initialStockArray: nextBranchReport.initialStockArray, initialStock: nextBranchReport.initialStock })
    }

    throw error;
  }
}

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

export const getInitialStockValue = async ({ branchId, date }) => {

  const dateMinusOne = new Date(date)
  dateMinusOne.setDate(dateMinusOne.getDate() - 1)

  const { topDate} = getDayRange(date)
  const { bottomDate: yesterdayBottomDate, topDate: yesterdayTopDate } = getDayRange(dateMinusOne)

  const todayBranchReport = await fetchBranchReport({ branchId, date })

  const pricesDate = todayBranchReport.dateSent ? todayBranchReport.dateSent : topDate

  const initialStock = await Stock.find({

    createdAt: { $lt: yesterdayTopDate, $gte: yesterdayBottomDate },
    branch: branchId
  })

  const branchPrices = await pricesAggregate(branchId, pricesDate)

  if (!branchPrices || !initialStock) return 0.0

  return calculateInitialStock({ branchPrices, stock: initialStock })
}

export const calculateInitialStock = ({ branchPrices, stock }) => {


  let total = 0.0

  stock.forEach((stock) => {

    const priceIndex = branchPrices.findIndex((price) => (price.productId.toString() == stock.product.toString()))

    total += parseFloat(branchPrices[priceIndex].latestPrice * stock.weight)

  })

  return total
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

  let branchReport = null
  let nextBranchReport = null
  let deletedStock = null
  let updatedEmployeeDailyBalance = null
  let updatedBranchReport = null
  let updatedNextBranchReport = null

  try {

    deletedStock = await Stock.findByIdAndDelete(stockId)

    if (!deletedStock) throw new Error("No se logró crear el registro")

    branchReport = await fetchBranchReport({ branchId: deletedStock.branch, date: deletedStock.createdAt })

    if (!branchReport) throw new Error("No se encontró ni se pudo crear el reporte")
    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {

      $pull: { finalStockArray: deletedStock._id },
      $inc: { finalStock: -deletedStock.amount, balance: -deletedStock.amount }

    }, { new: true })

    if (updatedBranchReport) {

      if (updatedBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: updatedBranchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

    } else {

      throw new Error("Hubo un problema encontrando el reporte a modificar");
    }

    const nextBranchReportDate = new Date(deletedStock.createdAt)
    nextBranchReportDate.setDate(nextBranchReportDate.getDate() + 1)

    nextBranchReport = await fetchBranchReport({ branchId: deletedStock.branch, date: nextBranchReportDate })

    if (!nextBranchReport) {

      nextBranchReport = await createDefaultBranchReport({ branchId: deletedStock.branch, date: nextBranchReportDate, companyId: company })
    }

    if (!nextBranchReport) throw new Error("No se encontró ni se pudo crear el reporte")

    updatedNextBranchReport = await BranchReport.findByIdAndUpdate(nextBranchReport._id, {

      $pull: { initialStockArray: deletedStock._id },
      $inc: {
        initialStock: -deletedStock.amount,
        balance: deletedStock.amount
      },

    }, { new: true })

    if (updatedNextBranchReport) {

      if (updatedNextBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: updatedNextBranchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

    } else {

      throw new Error("Hubo un problema encontrando el reporte a modificar");
    }

    res.status(200).json({ message: 'Registro borrado correctamente' })

  } catch (error) {

    if (deletedStock) {

      await Stock.create({ deletedStock })
    }

    if (!updatedEmployeeDailyBalance && updatedBranchReport && (branchReport.balance != updatedBranchReport.balance || branchReport.finalStockArray != updatedBranchReport.finalStockArray)) {

      await BranchReport.findByIdAndUpdate(branchReport._id, { balance: branchReport.balance, finalStockArray: branchReport.finalStockArray })
    }

    if (!updatedEmployeeDailyBalance && updatedNextBranchReport && (nextBranchReport.balance != updatedNextBranchReport.balance || updatedNextBranchReport.initialStockArray != nextBranchReport.initialStockArray)) {

      await BranchReport.findByIdAndUpdate(nextBranchReport._id, { balance: nextBranchReport.balance, initialStockArray: nextBranchReport.initialStockArray })
    }

    next(error);

  }
}

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

export const createAfternoonStock = async (req, res, next) => {

  const { pieces, weight, amount, branch, product, company, employee, createdAt } = req.body

  try {

    const newStock = new Stock({ pieces, employee, weight, amount, branch, product, company, createdAt })
    await af.save()

    await updateReportStock(branch, createdAt, amount)
    res.status(201).json({ message: 'New Afternoon Stock is created successfully', stock: newStock })

  } catch (error) {

    next(error)

  }
}