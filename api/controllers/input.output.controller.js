import Output from '../models/accounts/output.model.js'
import Input from '../models/accounts/input.model.js'
import { errorHandler } from '../utils/error.js'
import ProviderInput from '../models/providers/provider.input.model.js'
import { getDayRange, today } from '../utils/formatDate.js'
import { Types } from 'mongoose'
import { pushOrPullBranchReportRecord } from './branch.report.controller.js'
import { pushOrPullCustomerReportRecord } from './customer.controller.js'
import { employeeAggregate } from './employee.controller.js'
import { createStockAndUpdateBranchReport, deleteStockAndUpdateBranchReport } from './stock.controller.js'
import { branchAggregate } from './branch.controller.js'
import { productAggregate } from './product.controller.js'

const inputLookups = () => {
  return [
    ...employeeAggregate('employee'),
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $lookup: {
        from: 'branches',
        localField: 'branch',
        foreignField: '_id',
        as: 'branch'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $unwind: '$branch'
    }
  ]
}

const outputLookups = () => {
  return [
    ...employeeAggregate('employee'),
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $lookup: {
        from: 'branches',
        localField: 'branch',
        foreignField: '_id',
        as: 'branch'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $unwind: '$branch'
    }
  ]
}

export const newBranchInput = async (req, res, next) => {

  const { _id, weight, specialPrice, price, amount, comment, pieces, company, product, employee, addInStock, branch, createdAt } = req.body

  try {

    const newInput = await newBranchInputAndUpdateBranchReport({ _id, weight, comment, pieces, company, product, addInStock, employee, branch, amount, price, createdAt, specialPrice })

    res.status(200).json({ message: 'New input created', input: newInput })

  } catch (error) {

    next(error)
  }
}

export const newBranchInputAndUpdateBranchReport = async ({ _id, weight, comment, pieces, company, addInStock, product, employee, branch, amount, price, createdAt, specialPrice }) => {

  let input = null
  let stock = null

  try {

    input = await Input.create({ _id, weight, comment, pieces, company, addInStock, product, employee, branch, amount, price, createdAt, specialPrice })

    if (!input) throw new Error("No se logró crear la entrada a sucursal");

    await pushOrPullBranchReportRecord({
      branchId: branch,
      date: createdAt,
      record: input,
      affectsBalancePositively: false,
      amountField: 'inputs',
      arrayField: 'inputsArray',
      operation: '$addToSet'
    })

    if (input.addInStock) {
      stock = await createStockAndUpdateBranchReport(input)
    }

    return input

  } catch (error) {

    if (stock) {

      await deleteStockAndUpdateBranchReport({ stock_id: stock._id, alsoDeleteInitial: true })
    }

    if (input) {

      await deleteInputById(input._id)
    }

    throw error;
  }
}

export const newCustomerInput = async (req, res, next) => {

  const { _id, weight, price, pieces, amount, employee, comment, product, company, customer, createdAt } = req.body

  try {

    const input = await Input.create({ _id, weight, pieces, price, employee, amount, comment, product, company, customer, createdAt })

    await pushOrPullCustomerReportRecord({
      customerId: customer,
      date: createdAt,
      record: input,
      affectsBalancePositively: false,
      amountField: 'salesAmount',
      arrayField: 'branchProducts'
    })

    res.status(200).json({ input })

  } catch (error) {

    next(error)
  }
}

export const getNetDifference = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const outputs = await Output.find({
      $and: [
        {
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
    }).populate({ path: 'branch', select: 'p' }).populate({ path: 'product', select: 'name' }).populate({ path: 'employee', select: 'name lastName' })

    const inputs = await Input.find({
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
    }).populate({ path: 'branch', select: 'p' }).populate({ path: 'product', select: 'name' }).populate({ path: 'employee', select: 'name lastName' })

    const employeesInputs = groupAndSumFunction(inputs)

    const employeesOutputs = groupAndSumFunction(outputs)

    const employeeNetDifference = {}

    Object.keys(employeesOutputs).forEach(employeeOutputs => {

      if (!employeeNetDifference[employeeOutputs]) {

        employeeNetDifference[employeeOutputs] = {

          employee: employeesOutputs[employeeOutputs].employee,
          totalDifference: 0.00,
          netDifference: {}
        }
      }

      Object.keys(employeesOutputs[employeeOutputs].productsMovement).forEach((product => {

        const difference = (employeesInputs[employeeOutputs] ? employeesInputs[employeeOutputs].productsMovement[product] ? employeesInputs[employeeOutputs].productsMovement[product].weight : 0 : 0) - (employeesOutputs[employeeOutputs].productsMovement[product].weight)

        employeeNetDifference[employeeOutputs].totalDifference += difference

        employeeNetDifference[employeeOutputs].netDifference[product] = {

          name: employeesOutputs[employeeOutputs].productsMovement[product].name,
          difference: difference
        }
      }))
    })


    Object.keys(employeesInputs).forEach(employeeInputs => {

      if (!employeeNetDifference[employeeInputs]) {

        employeeNetDifference[employeeInputs] = {

          employee: employeesInputs[employeeInputs].employee,
          totalDifference: 0.00,
          netDifference: {}
        }
      }

      Object.keys(employeesInputs[employeeInputs].productsMovement).forEach((product => {

        if (!employeeNetDifference[employeeInputs].netDifference[product]) {

          const difference = (employeesInputs[employeeInputs].productsMovement[product].weight) - (employeesOutputs[employeeInputs] ? employeesOutputs[employeeInputs].productsMovement[product] ? employeesOutputs[employeeInputs].productsMovement[product].weight : 0 : 0)

          employeeNetDifference[employeeInputs].totalDifference += difference

          employeeNetDifference[employeeInputs].netDifference[product] = {

            name: employeesInputs[employeeInputs].productsMovement[product].name,
            difference: difference
          }
        }
      }))
    })

    res.status(200).json({ netDifference: employeeNetDifference })

  } catch (error) {

    next(error)
  }
}

const groupAndSumFunction = (items) => {

  const result = {}

  items.forEach(element => {

    const employee = element.employee
    const product = element.product._id
    const productName = element.product.name
    const weight = element.weight

    if (!result[employee._id]) {

      result[employee._id] = {
        employee: employee,
        productsMovement: {}
      }
    }

    if (result[employee._id].productsMovement) {

      if (result[employee._id].productsMovement[product]) {

        result[employee._id].productsMovement[product].weight += weight / (element.branch?.p || 1)

      } else {

        result[employee._id].productsMovement[product] = {
          weight: weight / (element.branch?.p || 1),
          name: productName
        }
      }

    } else {

      result[employee._id].productsMovement[product] = {
        weight: weight / (element.branch?.p || 1),
        name: productName
      }
    }
  });

  return result
}

export const getBranchInputsRequest = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  try {

    const inputs = await getBranchInputs({ branchId, date })

    if (inputs.length == 0) {

      next(errorHandler(404, 'Not inputs found'))

    } else {

      res.status(200).json({ inputs: inputs })
    }

  } catch (error) {

    next(error)
  }

}

export const getBranchInputs = async ({ branchId, date }) => {

  const { bottomDate, topDate } = getDayRange(date)

  const inputs = await Input.find({

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
  }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'product', select: 'name' }).populate({ path: 'branch', select: 'branch' })

  return inputs.length > 0 ? inputs : []
}

export const getBranchProviderInputsRequest = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date(req.params.date)

  try {

    const providerInputs = await getBranchProviderInputs({ branchId, date })

    if (providerInputs) {

      res.status(200).json({ providerInputs: providerInputs })
    }

  } catch (error) {

    next(error)
  }
}


export const getBranchProviderInputs = async ({ branchId, date }) => {

  const { bottomDate, topDate } = getDayRange(date)

  const providerInputs = await ProviderInput.find({

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
  }).populate({ path: 'product', select: 'name' }).populate({ path: 'employee', select: 'name lastName' })

  return providerInputs.length > 0 ? providerInputs : []
}

export const getInputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)


  try {

    const inputs = await Input.aggregate([
      {
        $match: {
          "createdAt": { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          "company": new Types.ObjectId(companyId)
        }
      },
      ...inputLookups()
    ])

    if (inputs.length == 0) {

      next(errorHandler(404, 'Not inputs found'))

    } else {

      let totalWeight = 0
      const branchInputs = []
      const customerInputs = []

      inputs.forEach(input => {

        if (input.branch === undefined) {

          customerInputs.push(input)

        } else {

          branchInputs.push(input)
        }

        totalWeight += input.weight
      })

      branchInputs.sort((input, nextInput) => {

        return input.branch.position - nextInput.branch.position
      })

      res.status(200).json({ inputs: [...branchInputs, ...customerInputs], totalWeight: totalWeight })
    }

  } catch (error) {

    next(error)
  }

}

export const getBranchInputsAvg = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date()

  date.setDate(date.getDate() - 30)

  try {

    const branchInputsAvg = await Input.aggregate([
      {
        $match: {
          "branch": new Types.ObjectId(branchId),
          "createdAt": { $gte: date }
        }
      },
      {
        $project: {
          total: { $sum: ["$amount"] }
        }
      },
      {
        $group: {
          _id: branchId,
          average: { $avg: '$total' }
        }
      }
    ])

    if (branchInputsAvg.length > 0) {

      res.status(200).json({ branchInputsAvg: branchInputsAvg[0].average })

    } else {

      res.status(200).json({ branchInputsAvg: 0 })
    }


  } catch (error) {

    next(error)
  }

}

export const deleteInput = async (req, res, next) => {

  const inputId = req.params.inputId

  try {

    await deleteInputById(inputId)

    res.status(200).json({ message: 'Input deleted correctly' })

  } catch (error) {

    if (deletedInput) {

      await Input.create({ deletedInput })
    }

    next(error);
  }
}

export const deleteInputById = async (inputId) => {

  let deletedInput = null

  try {

    deletedInput = await Input.findByIdAndDelete(inputId)

    if (!deletedInput) throw new Error("No se eliminó la entrada");

    if (deletedInput.branch) {

      await pushOrPullBranchReportRecord({
        branchId: deletedInput.branch,
        date: deletedInput.createdAt,
        record: deletedInput,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'inputsArray',
        amountField: 'inputs'
      })

      if (deletedInput.addInStock && deletedInput.stock_id) {

        await deleteStockAndUpdateBranchReport({ stock_id: deletedInput.stock_id, alsoDeleteInitial: true })
      }

    } else {

      await pushOrPullCustomerReportRecord({
        customerId: deleteInput.customer,
        date: deletedInput.createdAt,
        record: deletedInput,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'branchProducts',
        amountField: 'salesAmount'
      })
    }

  } catch (error) {

    if (deletedInput) {

      await Input.create({ deletedInput })
    }

    throw error;
  }
}

export const newBranchOutput = async (req, res, next) => {

  const { _id, weight, comment, amount, price, pieces, company, product, employee, branch: branch, specialPrice, createdAt } = req.body

  try {

    const newOutput = await newBranchOutputAndUpdateBranchReport({ _id, weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice })
    res.status(200).json({ message: 'New output created', output: newOutput })

  } catch (error) {

    next(error)
  }
}

export const newBranchOutputAndUpdateBranchReport = async ({ _id, weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice }) => {

  let output = null

  try {

    output = await Output.create({ _id, weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice })

    if (!output) throw new Error("No se logró crear el registro")

    await pushOrPullBranchReportRecord({
      branchId: branch,
      date: createdAt,
      record: output,
      affectsBalancePositively: true,
      operation: '$addToSet',
      arrayField: 'outputsArray',
      amountField: 'outputs'
    })

    return output

  } catch (error) {

    if (output) {

      await Output.findByIdAndDelete(income._id)
    }

    throw error;
  }
}

export const newCustomerOutput = async (req, res, next) => {

  const { _id, weight, amount, comment, pieces, company, product, employee, customer, price, createdAt } = req.body

  try {

    const output = await Output.create({ _id, weight, comment, pieces, company, product, employee, customer, amount, price, createdAt })

    await pushOrPullCustomerReportRecord({
      customerId: customer,
      date: createdAt,
      record: output,
      affectsBalancePositively: true,
      operation: '$addToSet',
      amountField: 'returns',
      arrayField: 'returnsArray'
    })

    res.status(200).json({ message: 'New output created', output })

  } catch (error) {

    next(error)

  }
}

export const getBranchOutputsRequest = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  try {

    const outputs = await getBranchOutputs({ branchId, date })

    if (outputs.length == 0) {

      next(errorHandler(404, 'Not outputs found'))

    } else {

      res.status(200).json({ outputs: outputs })
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchOutputs = async ({ branchId, date }) => {

  const { bottomDate, topDate } = getDayRange(date)

  const outputs = await Output.find({

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
  }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'product', select: 'name' }).populate({ path: 'branch', select: 'branch' })

  return outputs.length > 0 ? outputs : []
}

export const getOutputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const outputs = await Output.aggregate([
      {
        $match: {
          "createdAt": { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          "company": new Types.ObjectId(companyId)
        }
      },
      ...outputLookups()
    ])

    if (outputs.length == 0) {

      next(errorHandler(404, 'Not outputs found'))

    } else {

      let totalWeight = 0

      const branchOutputs = []
      const customerOutputs = []

      outputs.forEach(output => {

        if (output.branch === undefined) {

          customerOutputs.push(output)

        } else {

          branchOutputs.push(output)
        }

        totalWeight += output.weight
      })

      branchOutputs.sort((output, nextOutput) => {

        return output.branch.position - nextOutput.branch.position
      })

      res.status(200).json({ outputs: [...branchOutputs, ...customerOutputs], totalWeight: totalWeight })
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchOutputsAvg = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date()

  date.setDate(date.getDate() - 30)

  try {

    const branchOutputsAvg = await Output.aggregate([
      {
        $match: {
          "branch": new Types.ObjectId(branchId),
          "createdAt": { $gte: date }
        }
      },
      {
        $project: {
          total: { $sum: ["$amount"] }
        }
      },
      {
        $group: {
          _id: branchId,
          average: { $avg: '$total' }
        }
      }
    ])

    if (branchOutputsAvg.length > 0) {

      res.status(200).json({ branchOutputsAvg: branchOutputsAvg[0].average })

    } else {

      res.status(200).json({ branchOutputsAvg: 0 })
    }

  } catch (error) {

    next(error)
  }

}

export const getProviderProductInputs = async (req, res, next) => {

  const { companyId, productId } = req.params
  const date = new Date(req.params.date)

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const providerInputs = await ProviderInput.find({

      $and: [
        {
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
          product: productId
        },
        {
          company: companyId
        }
      ]
    }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'product', select: 'name' })

    if (providerInputs.length > 0) {

      let providerInputsWeight = 0.0
      let providerInputsPieces = 0
      let providerInputsAmount = 0.0

      providerInputs.forEach((input) => {

        providerInputsWeight += input.weight
        providerInputsPieces += input.pieces
        providerInputsAmount += input.amount
      })

      providerInputs.sort((providerInput, nextProviderInput) => {

        return providerInput.branch.position - nextProviderInput.branch.position
      })

      res.status(200).json({ providerInputs: providerInputs, providerInputsWeight, providerInputsPieces, providerInputsAmount })

    } else {

      next(errorHandler(404, 'No provider inputs found'))
    }

  } catch (error) {

    next(error)
  }
}

export const getProviderInputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId
  const { bottomDate, topDate } = getDayRange(date)

  try {

    const providerInputs = await ProviderInput.aggregate([
      {
        $match: {
          "createdAt": { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          "company": new Types.ObjectId(companyId)
        }
      },
      ...productAggregate('product'),
      ...employeeAggregate('employee'),
      ...branchAggregate('branch'),
      {
        $group: {
          _id: "$product._id",
          totalWeight: { $sum: "$weight" },
          totalPieces: { $sum: "$pieces" },
          totalAmount: { $sum: "$amount" },
          inputs: { $push: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $sort: { "totalAmount": -1 }
      },
      {
        $project: {
          _id: 1,
          weight: 1,
          pieces: 1,
          amount: 1,
          inputs: 1,
          name: "$productDetails.name"
        }
      }
    ])

    if (providerInputs.length > 0) {
      res.status(200).json({ providerInputs })
    } else {
      next(errorHandler(404, 'No provider inputs found'))
    }

  } catch (error) {
    next(error)
  }
}

export const getBranchProviderInputsAvg = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date()

  date.setDate(date.getDate() - 30)

  try {

    const branchProviderInputsAvg = await ProviderInput.aggregate([
      {
        $match: {
          "branch": new Types.ObjectId(branchId),
          "createdAt": { $gte: date }
        }
      },
      {
        $project: {
          total: { $sum: ["$amount"] }
        }
      },
      {
        $group: {
          _id: branchId,
          average: { $avg: '$total' }
        }
      }
    ])

    if (branchProviderInputsAvg.length > 0) {

      res.status(200).json({ branchProviderInputsAvg: branchProviderInputsAvg[0].average })

    } else {

      res.status(200).json({ branchProviderInputsAvg: 0 })
    }

  } catch (error) {

    next(error)
  }

}

export const createBranchProviderInput = async (req, res, next) => {

  const { _id, weight, product, price, amount, employee, branch, company, comment, pieces, specialPrice, createdAt } = req.body

  try {
    const newProviderInput = await createBranchProviderInputAndUpdateBranchReport({ _id, weight, product, price, employee, branch, company, comment, pieces, amount, specialPrice, createdAt })

    res.status(200).json({ providerInput: newProviderInput })

  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const createBranchProviderInputAndUpdateBranchReport = async ({ _id, weight, product, price, employee, branch, company, comment, pieces, amount, specialPrice, createdAt }) => {

  let providerInput = null

  try {

    const providerInputData = { weight, product, price, employee, branch, company, comment, pieces, amount, specialPrice, createdAt: today(createdAt) ? new Date() : createdAt }

    if (_id) providerInputData._id = _id

    providerInput = await ProviderInput.create(providerInputData)

    if (!providerInput) throw new Error("No creó el registro")

    await pushOrPullBranchReportRecord({
      branchId: branch,
      date: createdAt,
      record: providerInput,
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'providerInputsArray',
      amountField: 'providerInputs',
    })

    return providerInput

  } catch (error) {

    if (providerInput) {

      await ProviderInput.findByIdAndDelete(providerInput._id)
    }

    throw error;
  }
}

export const createCustomerProviderInput = async (req, res, next) => {

  const { _id, weight, product, price, amount, employee, customer, company, comment, pieces, createdAt } = req.body

  let providerInput = null

  try {

    const providerInputData = { weight, product, price, amount, employee, customer, company, comment, pieces, createdAt }

    if (_id) providerInputData._id = _id

    providerInput = await ProviderInput.create(providerInputData)

    pushOrPullCustomerReportRecord({
      customerId: customer,
      date: createdAt,
      record: providerInput,
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'providerInputsArray',
      amountField: 'providerInputs'
    })

    res.status(200).json({ providerInput })

  } catch (error) {

    next(error)
  }
}

export const deleteProviderInput = async (req, res, next) => {

  const providerInputId = req.params.providerInputId

  let deletedProviderInput = null

  try {

    deletedProviderInput = await ProviderInput.findByIdAndDelete(providerInputId)

    if (!deletedProviderInput) throw new Error("No se eliminó el registro");

    if (deletedProviderInput.branch) {

      await pushOrPullBranchReportRecord({
        branchId: deletedProviderInput.branch,
        date: deletedProviderInput.createdAt,
        record: deletedProviderInput,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'providerInputsArray',
        amountField: 'providerInputs',
      })

    } else {

      await pushOrPullCustomerReportRecord({
        customerId: deletedProviderInput.customer,
        date: deletedProviderInput.createdAt,
        record: deleteProviderInput,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'providerProducts',
        amountField: 'salesAmount'
      })
    }

    res.status(200).json({ message: 'Registro eliminado', success: true })

  } catch (error) {

    if (deletedProviderInput) {

      await ProviderInput.create({ deletedProviderInput })
    }

    console.log(error)

    next(error);
  }
}

export const deleteOutput = async (req, res, next) => {

  const outputId = req.params.outputId

  if (!Types.ObjectId.isValid(outputId)) {
    return next(errorHandler(400, 'Invalid output ID'));
  }

  let deletedOutput = null

  try {

    let deletedOutput = await Output.findByIdAndDelete(outputId)

    if (deletedOutput.branch) {
      await pushOrPullBranchReportRecord({
        branchId: deletedOutput.branch,
        date: deletedOutput.createdAt,
        record: deletedOutput,
        affectsBalancePositively: true,
        operation: '$pull',
        arrayField: 'outputsArray',
        amountField: 'outputs'
      })
    } else {
      await pushOrPullCustomerReportRecord({
        customerId: deletedOutput.customer,
        date: deletedOutput.createdAt,
        record: deletedOutput,
        affectsBalancePositively: true,
        operation: '$pull',
        arrayField: 'returnsArray',
        amountField: 'returns'
      })
    }

    res.status(200).json('Registro eliminado')

  } catch (error) {

    if (deletedOutput) {

      await Output.create({ deletedOutput })
    }

    next(error);
  }
}